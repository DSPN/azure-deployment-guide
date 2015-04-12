var fragment = {
  "name": "DomainNameFragment",
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
      }
    },
    "resource": {
      "type": "Microsoft.ClassicCompute/domainNames"
    }
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;