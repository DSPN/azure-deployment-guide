/// <reference path="DeploymentTemplate.ts" />
/// <reference path="FragmentDefinition.ts" />
/// <reference path="IFragment.ts" />

module ExtensionCore.Csm {
    "use strict";

    export class Fragment<T extends StringMap<any>> {
        public parameters: T;
        public dependsOnIgnore: StringMap<boolean> = {};
        private _fragment: FragmentDefinition;
        private _parametersAdded: StringMap<any> = {};
        private _computedCalculated: StringMap<any> = {};
        private _conditionsAdded: StringMap<string> = {};

        constructor(fragmentDefinition: string) {
            this._fragment = <FragmentDefinition>JSON.parse(fragmentDefinition);

            if (this._fragment.computeds) {
                this._fragment.computeds.forEach((computed) => {
                    this._computedCalculated[computed.paths[0]] = undefined;
                });
            }

            var keys: string[] = [];
            for (var key in this._fragment.parameters) {
                keys.push(key);
            }

            this.parameters = <T>{};

            keys.forEach((param) => {
                Object.defineProperty(this.parameters, param, {
                    get: () => {
                        return this._getParameterValue(param);
                    },
                    set: (value: any) => {
                        this._addParameter(param, value);
                    }
                });
            });
        }

        public getResource(): DeploymentResource {
            // Go through all the parameters and make sure the required ones are set
            for (var param in this._fragment.parameters) {
                if (this._fragment.parameters[param].required && this._parametersAdded[param] === undefined) {
                    throw new Error("Required parameter {0} was missing".format(param));
                }
            }

            // If there is a child resource, we need to set a dependsOn for the parent resource
            if (this._fragment.resource.resources && this._fragment.resource.resources.length) {
                this._fragment.resource.resources.forEach((child) => {
                    if (!child.dependsOn) {
                        child.dependsOn = [];
                    }

                    var id = this.getDependsOnId();
                    if (child.dependsOn.indexOf(id) === -1) {
                        child.dependsOn.push(id);
                    }
                });
            }

            if (this._fragment.computeds) {
                this._fragment.computeds.forEach((computed) => {
                    if (computed.required && this._computedCalculated[computed.paths[0]] === undefined) {
                        throw new Error("A required computed was not calculated");
                    }
                });
            }

            return this._fragment.resource;
        }

        private _getParameterValue(name: string): any {
            return this._parametersAdded[name];
        }

        private _addParameter(name: string, value: any) {
            this._parametersAdded[name] = value;

            if (!this._fragment.parameters[name]) {
                throw new Error("The parameter named {0} does not exist".format(name));
            }

            if (this._fragment.parameters[name].condition && this._conditionsAdded[this._fragment.parameters[name].condition.name] !== this._fragment.parameters[name].condition.value) {
                throw new Error("Can't add parameter named {0} until the conditional named {1} is set to {2}".format(name, this._fragment.parameters[name].condition.name, this._fragment.parameters[name].condition.value));
            }

            this._fragment.parameters[name].paths.forEach((path) => {
                var action = this._fragment.parameters[name].action ? this._fragment.parameters[name].action : FragmentParameterAction.replace;
                var escape = this._fragment.parameters[name].escape;
                this._setValueOnPath(path.split("."), this._fragment.resource, value, action, escape);
            });

            this._calculateComputeds();
        }

        public setConditional(name: string, condition: string) {
            if (!this._fragment.conditionals) {
                throw new Error("No conditionals for this fragment");
            }

            if (!this._fragment.conditionals[name]) {
                throw new Error("No conditional named {0} for this fragment".format(name));
            }

            if (!this._fragment.conditionals[name][condition]) {
                throw new Error("No conditionals value of {0} for condition {1}".format(condition, name));
            }

            var value = this._fragment.conditionals[name][condition];
            this._setValueOnPath(value.path.split("."), this._fragment.resource, value.resource, FragmentParameterAction.replace);
            this._conditionsAdded[name] = condition;
        }

        public getDependsOnId() {
            var typeSplit = this._fragment.resource.type.split("/");
            var nameSplit = this._fragment.resource.name.split("/");

            if (typeSplit.length !== nameSplit.length + 1) {
                throw new Error("Fragment type and name are malformed: Type: '{0}', Name: '{1}'".format(this._fragment.resource.type, this._fragment.resource.name));
            }

            if (typeSplit.length < 2) {
                throw new Error("Fragment type is malformed. '{0}'".format(this._fragment.resource.type));
            }

            var result = "{0}/{1}/{2}".format(typeSplit[0], typeSplit[1], nameSplit[0]);

            for (var i = 2; i < typeSplit.length; i++) {
                result = result + "/{0}/{1}".format(typeSplit[i], nameSplit[i-1]);
            }

            return result;
        }

        public getResourceId(subscription?: string, resourceGroup?: string) {
            var providerResource = this.getDependsOnId();

            if (subscription && resourceGroup) {
                return "/subscriptions/{0}/resourcegroups/{1}/providers/{2}".format(subscription, resourceGroup, providerResource);
            }

            return "[concat(resourceGroup().id, '/providers/{0}')]".format(providerResource);
        }

        public dependsOn(otherFragment: Fragment<any>) {
            this.addDependsOn(otherFragment.getDependsOnId());
        }

        public addRelatedTag(resourceId: string) {
            this.addTag("hidden-related:{0}".format(resourceId), "Resource");
        }

        public addLinkTag(resourceId: string) {
            this.addTag("hidden-link:{0}".format(resourceId), "Resource");
        }

        public addTag(key: string, value: string) {
            if (!this._fragment.resource.tags) {
                this._fragment.resource.tags = {};
            }
            this._fragment.resource.tags[key] = value;
        }

        public getReferenceTag(withBrackets: boolean, property?: string): string {
            var providerId = this.getDependsOnId();
            var template = "reference('{0}')";

            if (property) {
                template = template + "." + property;
            }

            if (withBrackets) {
                template = "[" + template + "]";
            }

            return template.format(providerId);
        }

        private _calculateComputeds() {
            // Go through all the computed and apply them when required
            if (this._fragment.computeds) {
                this._fragment.computeds.forEach((computed) => {
                    // FIrst check to make sure the conditions are met
                    if (computed.required && computed.condition && this._conditionsAdded[computed.condition.name] !== computed.condition.value) {
                        throw new Error("A computed value is required, and requires that condition {0} be set to value {1}".format(computed.condition.name, computed.condition.value));
                    }

                    if (!computed.condition || this._conditionsAdded[computed.condition.name] === computed.condition.value) {
                        var requiredParams = computed.template.match(/{[^{|^}]+}/g).map((p) => {
                            return p.substring(1, p.length - 1);
                        });

                        var compute = true;
                        var formatObject: StringMap<any> = {};
                        // Determine if all the required params were added
                        requiredParams.forEach((param) => {
                            if (!this._parametersAdded[param]) {
                                compute = false;
                            } else {
                                var value = this.parameters[param];

                                if (typeof (value) !== "string") {
                                    throw new Error("A computed required parameter {0}, which was not a string".format(param));
                                }

                                // Escape value if escape option was specified on parameter
                                var escape = this._fragment.parameters[param].escape;
                                value = this._escapeIfNecessary(value, escape);

                                formatObject[param] = value;
                            }
                        });

                        if (compute) {
                            var templateValue = computed.template.format(formatObject);
                            computed.paths.forEach((path) => {
                                this._setValueOnPath(path.split("."), this._fragment.resource, templateValue, FragmentParameterAction.replace);
                            });

                            this._computedCalculated[computed.paths[0]] = templateValue;
                        }
                    }
                });
            }
        }

        public addDependsOn(id: string, ignoreValidation?: boolean) {
            if (!this._fragment.resource.dependsOn) {
                this._fragment.resource.dependsOn = [];
            }

            if (this._fragment.resource.dependsOn.indexOf(id) === -1) {
                if (ignoreValidation) {
                    this.dependsOnIgnore[id] = true;
                }
                
                this._fragment.resource.dependsOn.push(id);
            }
        }

        private _setValueOnPath(path: string[], objToSet: any, value: any, action: string, escape?: string) {
            for (var i = 0; i < path.length - 1; i++) {
                var pathString = path[i];

                if (pathString.match(/[0-9]+(?=\])/g)) {
                    var arrayIndices = pathString.match(/[0-9]+(?=\])/g);
                    var regex = ".*(?=";
                    arrayIndices.forEach((value) => {
                        regex += "\\[[0-9]\\]";
                    });
                    regex += ")";

                    var startingPath = pathString.match(regex)[0];
                    objToSet = objToSet[startingPath];
                    arrayIndices.forEach((arr) => {
                        if (Array.isArray(objToSet)) {
                            var index = parseInt(arr, 10);
                            if (index >= objToSet.length) {
                                throw new Error("Out of range. Tried to access index {0} on an array of length {1}".format(index, objToSet.length));
                            }
                            objToSet = objToSet[parseInt(arr, 10)];
                        } else {
                            throw new Error("Tried to index an array that is not an array.");
                        }
                    });
                } else {
                    if (!objToSet[pathString]) {
                        objToSet[pathString] = {};
                    }
                    objToSet = objToSet[pathString];
                }
            }

            // Escape value if escape option was specified on parameter
            value = this._escapeIfNecessary(value, escape);

            if (path[path.length - 1].match(/[0-9]+(?=\])/g)) {
                var arrayIndices = path[path.length - 1].match(/[0-9]+(?=\])/g);
                var startingPath = path[path.length - 1].match(/.*(?=\[)/)[0];
                if (arrayIndices.length > 1) {
                    throw new Error("The final path can only contain 1 array index");
                }
                var finalIndex = parseInt(arrayIndices[0], 10)
                if (!Array.isArray(objToSet[startingPath])) {
                    throw new Error("Tried to index an array that is not an array");
                }

                if (finalIndex >= (<any[]>objToSet[startingPath]).length) {
                    throw new Error("Out of range. Tried to access index {0} on an array of length {1}".format(finalIndex, (<any[]>objToSet[startingPath]).length));
                }

                if (StringEx.equals(action, FragmentParameterAction.replace, StringComparison.IgnoreCase)) {
                    objToSet[startingPath][finalIndex] = value;
                } else if (StringEx.equals(action, FragmentParameterAction.arrayPush, StringComparison.IgnoreCase)) {
                    if (!Array.isArray(objToSet[startingPath][finalIndex])) {
                        objToSet[startingPath][finalIndex] = [];
                    }

                    (<any[]>objToSet[startingPath][finalIndex]).push(value);
                }
            } else {
                if (StringEx.equals(action, FragmentParameterAction.replace, StringComparison.IgnoreCase)) {
                    objToSet[path[path.length - 1]] = value;
                } else if (StringEx.equals(action, FragmentParameterAction.arrayPush, StringComparison.IgnoreCase)) {
                    if (!Array.isArray(objToSet[path[path.length - 1]])) {
                        objToSet[path[path.length - 1]] = [];
                    }

                    (<any[]>objToSet[path[path.length - 1]]).push(value);
                }

            }
        }

        private _escapeIfNecessary(value: string, escape: string): string {
            if (typeof value === "string" && StringEx.equals(escape, FragmentParameterEscape.powershell, StringComparison.IgnoreCase)) {
                value = value.replace(/`/g, "``");
                value = value.replace(/"/g, "`\"");
                value = value.replace(/'/g, "`'");
            }

            return value;
        }
    }
}