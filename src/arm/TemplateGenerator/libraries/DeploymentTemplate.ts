/// <reference path="IFragment.ts" />

module ExtensionCore.Csm {
    "use strict";

    export interface DeploymentTemplate {
        $schema: string;
        contentVersion: string;
        tags?: StringMap<string>;
        parameters: StringMap<DeploymentParamter>;
        variables?: StringMap<string>;
        resources: DeploymentResource[];
        outputs?: StringMap<DeploymentOutput>;
    }

    export interface DeploymentResource extends StringMap<any> {
        apiVersion: string;
        name: string;
        type: string;
        plan?: StringMap<string>;
        location: string;
        tags?: StringMap<string>;
        dependsOn?: string[];
        properties?: StringMap<Object>;
        resources?: DeploymentResource[];
    }

    export interface DeploymentOutput {
        type: string;
        value: string;
    }

    export interface DeploymentParamter {
        type: string;
        allowedValues?: string[];
        defaultValue?: string;
    }
} 