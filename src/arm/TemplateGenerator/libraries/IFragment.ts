    interface String {
        format(...restArgs: any[]): string;
        format(formatSpecifierMap: Object): string;
    }

    function format() {
        var name, args = arguments;

        if (args && args.length === 1 && args[0] && typeof args[0] === "object") {
            args = args[0];
            return this.replace(/\{[a-zA-Z$_\d]*\}/g, function (match, num) {
                name = match.substring(1, match.length - 1);
                return args.hasOwnProperty(name) ? args[name] : match;
            });
        }

        return this.replace(/\{(\d+)\}/g, function (match, num) {
            return args[num] !== undefined ? args[num] : match;
        });
    }

    String.prototype["format"] = format;

    interface StringMap<T> {
        [key: string]: T;
    }

module ExtensionCore.Csm {
    "use strict";

    export interface IFragment extends StringMap<any> {
        resourceName: string;
        resourceLocation: string;
        apiVersion: string;
    }
}