var fragment = {
  "name": "DataDiskFragment",
  "publisher": "Microsoft",
  "version": "0.1.0-preview",
  "content": {
    "parameters": {
      "storageBlobEndpoint": {
        "paths": [],
        "required": true
      },
      "domainName": {
        "paths": [],
        "required": true
      },
      "virtualMachineName": {
        "paths": [],
        "required": true
      },
      "diskSalt": {
        "paths": [],
        "required": true
      },
      "lun": {
        "paths": [
          "lun"
        ],
        "required": true
      },
      "caching": {
        "paths": [
          "caching"
        ],
        "required": true
      },
      "diskSize": {
        "paths": [
          "diskSize"
        ],
        "required": true
      }
    },
    "resource": {},
    "computeds": [
      {
        "paths": [
          "vhdUri"
        ],
        "template": "[concat({storageBlobEndpoint}, 'vhds/{domainName}-{virtualMachineName}-data-{diskSalt}.vhd')]",
        "required": true
      }
    ]
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;