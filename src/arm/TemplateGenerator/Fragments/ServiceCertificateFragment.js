var fragment = {
  "name": "ServiceCertificateFragment",
  "publisher": "Microsoft",
  "version": "0.1.0-preview",
  "content": {
    "parameters": {
      "domainName": {
        "paths": [],
        "required": true
      },
      "resourceName": {
        "paths": [],
        "required": true
      },
      "certificateData": {
        "paths": [
          "properties.data"
        ],
        "required": true
      },
      "certificatePassword": {
        "paths": [
          "properties.password"
        ],
        "required": false
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
      "type": "Microsoft.ClassicCompute/domainNames/serviceCertificates",
      "properties": {
        "certificateFormat": "pfx"
      }
    },
    "computeds": [
      {
        "paths": [
          "name"
        ],
        "template": "{domainName}/{resourceName}",
        "required": true
      }
    ]
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;