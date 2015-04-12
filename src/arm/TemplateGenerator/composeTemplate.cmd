@echo off

set ROOT=%~dp0

echo Cleaning up old files
del extensioncore.js
del extensioncore.d.ts
del generator.js
del data.js
copy template.json template.old.json

echo Compiling ExtensionCore
%ROOT%\typescript\tsc.exe -d --out extensioncore.js -t ES5 libraries\IFragment.ts libraries\Fragment.ts libraries\DeploymentTemplate.ts libraries\FragmentDefinition.ts libraries\TemplateFactory.ts libraries\String.ts libraries\Array.ts libraries\IPv4Address.ts libraries\IPv4Subnet.ts libraries\Error.ts
if not exist "%ROOT%\extensioncore.d.ts" goto die
echo module.exports.ExtensionCore = ExtensionCore >> extensioncore.js


echo Compiling Generator.ts
%ROOT%\typescript\tsc.exe -t ES5 generator.ts
if not exist "%ROOT%\generator.js" goto die
copy generator.js temp.js
echo var ExtensionCore = require('./extensioncore').ExtensionCore > generator.js
type temp.js >> generator.js
del temp.js
echo module.exports.generateTemplate = generateTemplate >> generator.js

echo Compiling Data.ts
%ROOT%\typescript\tsc.exe -t ES5 data.ts
if not exist "%ROOT%\data.js" goto die
echo module.exports.data = data >> data.js

echo Generating Template
del template.json
%ROOT%\nodejs\node.exe main.js generator.js data.js >> template.json

echo Template compiled and saved to template.json
goto end

:die
echo Composition has failed

:end