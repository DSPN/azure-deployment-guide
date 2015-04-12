interface Array<T> {
    toDictionary(getKey: (item: T) => string): { [key: string]: T; };
    first(predicate?: (value: T) => boolean): T;
}
module ExtensionCore.Polyfills {
    function toDictionary<T>(getKey: (item: T) => string) {
        var dictionary: { [key: string]: T; } = {};

        this.forEach((item: T) => {
            var key = getKey(item);

            if (key) {
                dictionary[key] = item;
            }
        });

        return dictionary;
    }

    if (!Array.prototype.toDictionary) {
        Array.prototype.toDictionary = toDictionary;
    }

    function first(predicate) {
        var length = this.length, i, value;

        if (length === 0) {
            return null;
        }

        if (predicate === undefined) {
            return this[0];
        }

        for (i = 0; i < length; i++) {
            value = this[i];
            if (predicate(value) === true) {
                return value;
            }
        }

        return null;
    }

    if (!Array.prototype.first) {
        Array.prototype.first = first;
    }
}
