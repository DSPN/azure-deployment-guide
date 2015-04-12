(function() {
    var ExtensionCore = require('./extensioncore.js').ExtensionCore;

    var templateGeneratorPath = "",
        templateParameterPath = "";
    var cont = true;
    if (process.argv.length !== 4) {
        console.error("You must provide the path to the generator module and the data module");
        cont = false;
    }

    process.argv.forEach(function(val, index, array) {
        if (index === 2) {
            templateGeneratorPath = val;
        }

        if (index === 3) {
            templateParameterPath = val;
        }
    });

    if (cont) {
        var generator = require("./" + templateGeneratorPath);
        var data = require("./" + templateParameterPath).data;

        var fragments = require('./fragments.js').fragments;
        
        console.log(generator.generateTemplate(data, fragments));
    }
})();