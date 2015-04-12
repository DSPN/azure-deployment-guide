/// <reference path="IFragment.ts" />
/// <reference path="DeploymentTemplate.ts" />
/// <reference path="..\definitions\jquery.d.ts" />

module ExtensionCore.Csm {
    "use strict";
    // TODO: investigate a better mechanism for array pushes that is more user friendly
    export class FragmentParameterAction {
        public static replace: string = "replace";
        public static arrayPush: string = "arraypush";
    }

    export class FragmentParameterEscape {
        public static powershell: string = "powershell"
    }

    export interface FragmentDefinition {
        parameters: StringMap<FragmentParameter>;
        resource: DeploymentResource;
        conditionals: StringMap<StringMap<FragmentCondition>>;
        computeds: ComputedParameter[];
    }

    export interface ComputedParameter {
        paths: string[];
        template: string;
        required: boolean;
        condition?: ParameterCondition;
    }

    export interface FragmentParameter {
        paths: string[];
        required: boolean;
        condition?: ParameterCondition;
        action?: string;
        escape?: string;
    }

    export interface ParameterCondition {
        name: string;
        value: string;
    }

    export interface FragmentCondition {
        path: string;
        resource: any;
    }

    export function getFragmentStrings(fragmentFileUris: StringMap<string>): JQueryPromiseV<StringMap<string>> {
        var result: StringMap<string> = {};
        var deferred = $.Deferred<JQueryDeferredV<StringMap<string>>>();
        var promises: JQueryPromiseV<string>[] = [];

        for (var fragment in fragmentFileUris) {
            promises.push(_downloadFragment(fragmentFileUris, fragment, result));
        }

        $.when.apply(this, promises).done(() => {
            deferred.resolve(result);
        }).fail(() => {
            deferred.reject();
        });

        return deferred.promise();
    }

    function _downloadFragment(fileUris: StringMap<string>, fragmentName: string, result: StringMap<string>): JQueryPromiseV<string> {
        return $.ajax(fileUris[fragmentName]).then((fragmentObject) => {
            var nameSplit = fragmentName.split(".");
            result[nameSplit[0] + "_" + nameSplit[1]] = JSON.stringify(fragmentObject);
        });
    }
}