class ErrorBase implements Error {
    public name: string;
    public message: string;
    public stack: string;

    constructor(message?: string) {
        Error.apply(this, arguments);
        this.name = this["constructor"].prototype.name;
        this.message = message;
    }
}
(<any>ErrorBase).prototype = Error.prototype;

class InvalidOperationError extends ErrorBase {
}

class ArgumentError extends ErrorBase {
    constructor(argumentName: string, reason?: string) {
        var reasonMessage: string = reason ? "Reason: {0}".format(reason) : "";
        super("Invalid argument: '{0}'. {1}".format(argumentName, reasonMessage));
    }
}

class AbstractMethodError extends ErrorBase {
    constructor(className: string, methodName: string) {
        super("cannot call abstract method {1} of class {0}. Make sure it is implemented in a derived class.".format(className, methodName));
    }
}