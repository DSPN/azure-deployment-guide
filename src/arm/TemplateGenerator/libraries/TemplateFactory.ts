/// <reference path="DeploymentTemplate.ts" />
/// <reference path="FragmentDefinition.ts" />
/// <reference path="Fragment.ts" />

module ExtensionCore.Csm {
    "use strict";
     export class TemplateFactory {
         private _template: DeploymentTemplate;
         private _resources: Fragment<any>[] = [];

         constructor() {
             this._template = {
                 $schema: "http://schema.management.azure.com/schemas/2014-04-01-preview/deploymentTemplate.json#",
                 contentVersion: "1.0.0.0",
                 parameters: {},
                 resources: []
             };
         }

         public addFragment(fragment: Fragment<any>) {
             this._resources.push(fragment);
         }

         public addResource(resource: DeploymentResource) {
             this._template.resources.push(resource);
         }

         public addParameter(name: string, param: DeploymentParamter) {
             if (this._template.parameters[name]) {
                throw new Error("Parameter {0} is already added".format(name));
             }

             this._template.parameters[name] = param;
         }

         public addOutput(outputName: string, outputType: string, outputValue: string) {
            if (!this._template.outputs) {
                this._template.outputs = {};
            }

            this._template.outputs[outputName] = {
                type: outputType,
                value: outputValue
            };
         }

         public generateTemplate() {
             // Ensure that all the depends on resources are present
             var resources: StringMap<boolean> = {};
             this._resources.forEach((fragment) => {
                 resources[fragment.getDependsOnId()] = true;
                 this._template.resources.push(fragment.getResource());

                 for (var dependsOn in fragment.dependsOnIgnore) {
                    resources[dependsOn] = true;
                 }
             });

             this._template.resources.forEach((resource) => {
                 if (resource.dependsOn) {
                     resource.dependsOn.forEach((depends) => {
                         if (!resources[depends]) {
                             throw new Error("{0}/{1} depends on {2}, but it was not present in the template".format(resource.type, resource.name, depends));
                         }
                     });
                 }
             });

             return JSON.stringify(this._template);
         }
     }
}