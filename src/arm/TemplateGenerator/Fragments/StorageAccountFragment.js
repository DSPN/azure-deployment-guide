var fragment = {
  "name": "StorageAccountFragment",
  "publisher": "Microsoft",
  "version": "0.1.0-preview",
  "content": {
    "parameters": {
      "resourceName": {
        "paths": [
          "name"
        ],
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
      "accountType": {
        "paths": [
          "properties.accountType"
        ],
        "required": true
      }
    },
    "resource": {
      "type": "Microsoft.ClassicStorage/storageAccounts"
    }
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;