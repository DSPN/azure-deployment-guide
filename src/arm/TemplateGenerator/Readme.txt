Template Generator Readme

====================================================
BASIC WORKFLOW
====================================================
The tool has a few parts. Your main task is to take existing fragments and generate a template. You will do that like so:

generator.ts is a TypeScript file that declares 1 function, 'generateTemplate'. This function takes in a data object and a dictionary of fragments. It should return a template string. A quick storage account template is included as an example. Modify this typescript file to include all of your logic to generate the template.

data.ts is a TypeScript file that declares 1 variable, 'data'. This is the object that will be passed into the generator.ts function. When this transitions to the UI, data will be populated by the user using the UI. 

When both of these files are modified to your liking, simply execute composeTemplate.cmd. This will compile the typescript down and execute its functions. The finished template will be saved in template.json.

====================================================
ADDING FRAGMENTS
====================================================
It is possible to add new fragments, on top of the standard VM fragments. Here is how:

1. Add your new fragment file to the 'Fragments' folder. Note this needs to contain "name", "publisher", "version", "$schema", and "content". Use existing fragments as an example.
2. Modify fragment.js and add the following lines
  At the top
  var yourFragment = require('./Fragments/YourFragment').fragment

  Before the last line
  fragments[yourFragment.publisher + "_" + yourFragment.name] = JSON.stringify(yourFragment.content);

At this point, your new fragment will start appearing in your generateTemplate function. The key of the dictionary will be "{Publisher}_{Name}"