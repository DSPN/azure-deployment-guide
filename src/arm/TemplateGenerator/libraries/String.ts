/// <reference path="IFragment.ts" />

enum StringComparison {
    IgnoreCase
}

// TODO: Move to String when TypeScript supports static extensions of built in types.
class StringEx {
    public static equals(str1: string, str2: string, stringComparison?: StringComparison): boolean {
        if (typeof str1 !== "string" || typeof str2 !== "string") {
            return false;
        }

        if (stringComparison === StringComparison.IgnoreCase) {
            str1 = str1.toUpperCase();
            str2 = str2.toUpperCase();
        }

        return str1 === str2;
    }

    public static isStringInArray(str: string, array: string[], stringComparison?: StringComparison): boolean {
        if (typeof str !== "string" || !Array.isArray(array)) {
            return false;
        }

        return !!array.first((arrayStr: string) => {
            return StringEx.equals(str, arrayStr, stringComparison);
        });
    }

    public static startsWith(str: string, prefix: string, stringComparison?: StringComparison): boolean {
        if (typeof str !== "string" || typeof prefix !== "string") {
            return false;
        }

        if (stringComparison === StringComparison.IgnoreCase) {
            str = str.toUpperCase();
            prefix = prefix.toUpperCase();
        }

        return str.length >= prefix.length && str.indexOf(prefix) === 0;
    }

    public static endsWith(str: string, suffix: string, stringComparison?: StringComparison): boolean {
        if (typeof str !== "string" || typeof suffix !== "string") {
            return false;
        }

        if (stringComparison === StringComparison.IgnoreCase) {
            str = str.toUpperCase();
            suffix = suffix.toUpperCase();
        }

        return str.length >= suffix.length && str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    // A well-known format for defining Dictionary<string,string> or StringMap<string> in config.
    // Use this function to parse it out.
    // The format is: "key:value,key2:value2,key3:value3"
    public static convertToStringMap(str: string): StringMap<string> {
        var result: StringMap<string> = {};

        str.split(",").forEach((map: string) => {
            var split = map.split(":");

            if (split.length !== 2) {
                return;
            }

            result[split[0]] = split[1];
        });

        return result;
    }
}

