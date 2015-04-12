var fragment = {
  "name": "InputEndpointFragment",
  "publisher": "Microsoft",
  "version": "0.1.0-preview",
  "content": {
    "parameters": {
      "endpointName": {
        "paths": [
          "endpointName"
        ],
        "required": true
      },
      "enableDirectServerReturn": {
        "paths": [
          "enableDirectServerReturn"
        ],
        "required": false
      },
      "privatePort": {
        "paths": [
          "privatePort"
        ],
        "required": true
      },
      "publicPort": {
        "paths": [
          "publicPort"
        ],
        "required": false
      },
      "protocol": {
        "paths": [
          "protocol"
        ],
        "required": true
      },
      "loadBalancedEndpointSetName": {
        "paths": [
          "loadBalancedEndpointSetName"
        ],
        "required": false
      },
      "probePort": {
        "paths": [
          "probe.port"
        ],
        "required": false
      },
      "probeProtocol": {
        "paths": [
          "probe.protocol"
        ],
        "required": false
      },
      "probePath": {
        "paths": [
          "probe.path"
        ],
        "required": false
      }
    },
    "resource": {}
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;