var fragment = {
  "name": "VirtualNetworkFragment",
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
      "addressSpaces": {
        "paths": [
          "properties.addressSpace.addressPrefixes"
        ],
        "required": true,
        "action": "arraypush"
      },
      "subnets": {
        "paths": [
          "properties.subnets"
        ],
        "required": true,
        "action": "arraypush"
      },
      "dnsServers": {
        "paths": [
          "properties.dhcpOptions.dnsServers"
        ],
        "required": false,
        "action": "arraypush"
      }
    },
    "resource": {
      "type": "Microsoft.ClassicNetwork/virtualNetworks"
    }
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;