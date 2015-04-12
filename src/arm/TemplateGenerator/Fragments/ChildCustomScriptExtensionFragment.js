var fragment = {
  "name": "ChildCustomScriptExtensionFragment",
  "publisher": "Microsoft",
  "version": "0.1.0-preview",
  "content": {
    "parameters": {
      "resourceName": {
        "paths": [],
        "required": true
      },
      "resourceLocation": {
        "paths": [
          "location"
        ],
        "required": true
      },
      "apiVersion": {
        "paths": [
          "apiVersion"
        ],
        "required": true
      },
      "virtualMachineName": {
        "paths": [],
        "required": true
      },
      "fileUris": {
        "paths": [
          "properties.parameters.public.fileUris"
        ],
        "required": true,
        "action": "arraypush"
      },
      "command": {
        "paths": [
          "properties.parameters.public.commandToExecute"
        ],
        "required": true
      }
    },
    "resource": {
      "type": "Microsoft.ClassicCompute/virtualMachines/extensions",
      "properties": {
        "extension": "CustomScriptExtension",
        "publisher": "Microsoft.Compute",
        "version": "1.*"
      }
    },
    "computeds": [
      {
        "paths": [
          "name"
        ],
        "template": "{virtualMachineName}/{resourceName}",
        "required": true
      }
    ],
    "conditionals": {
      "OS": {
        "Linux": {
          "path": "properties",
          "resource": {
            "extension": "CustomScriptForLinux",
            "publisher": "Microsoft.OSTCExtensions",
            "version": "1.*"
          }
        }
      }
    }
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;