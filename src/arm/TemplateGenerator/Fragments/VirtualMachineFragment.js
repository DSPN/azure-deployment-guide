var fragment = {
  "name": "VirtualMachineFragment",
  "publisher": "Microsoft",
  "version": "0.1.3-preview",
  "content": {
    "parameters": {
      "resourceName": {
        "paths": [
          "name",
          "properties.operatingSystemProfile.computerName"
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
      "domainNameResourceId": {
        "paths": [
          "properties.domainName.id"
        ],
        "required": true
      },
      "domainName": {
        "paths": [],
        "required": true
      },
      "virtualNetworkId": {
        "paths": [
          "properties.networkProfile.virtualNetwork.id"
        ],
        "required": false
      },
      "subnetNames": {
        "paths": [
          "properties.networkProfile.virtualNetwork.subnetNames"
        ],
        "required": false,
        "action": "arraypush"
      },
      "staticIpAddress": {
        "paths": [
          "properties.networkProfile.virtualNetwork.staticIpAddress"
        ],
        "required": false
      },
      "availabilitySetName": {
        "paths": [
          "properties.hardwareProfile.availabilitySet"
        ],
        "required": false
      },
      "adminUser": {
        "paths": [
          "properties.operatingSystemProfile.adminUserName"
        ],
        "required": true
      },
      "adminPassword": {
        "paths": [
          "properties.operatingSystemProfile.adminPassword"
        ],
        "required": false
      },
      "hardwareSize": {
        "paths": [
          "properties.hardwareProfile.size"
        ],
        "required": true
      },
      "storageBlobEndpoint": {
        "paths": [],
        "required": true
      },
      "mediaName": {
        "paths": [
          "properties.storageProfile.operatingSystemDisk.sourceImageName"
        ],
        "required": false
      },
      "remoteSourceImageLink": {
        "paths": [
          "properties.storageProfile.operatingSystemDisk.remoteSourceImageLink"
        ],
        "required": false
      },
      "operatingSystem": {
        "paths": [
          "properties.storageProfile.operatingSystemDisk.operatingSystem"
        ],
        "required": false
      },
      "timeZone": {
        "paths": [
          "properties.operatingSystemProfile.timeZone"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "automaticUpdates": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.enableAutomaticWindowsUpdates"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "domainToJoin": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.domainJoinProfile.domainToJoin"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "domainUser": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.domainJoinProfile.domainJoinCredentials.username"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "domainPassword": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.domainJoinProfile.domainJoinCredentials.password"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "domainJoinCredentialsName": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.domainJoinProfile.domainJoinCredentials.domain"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "unattendedSetupConfigurations": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.unattendedSetupConfigurations"
        ],
        "required": false,
        "action": "arraypush",
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "serviceCertificates": {
        "paths": [
          "properties.operatingSystemProfile.windowsOperatingSystemProfile.serviceCertificates"
        ],
        "required": false,
        "action": "arraypush",
        "condition": {
          "name": "OS",
          "value": "Windows"
        }
      },
      "linuxCertThumbprint": {
        "paths": [
          "properties.operatingSystemProfile.linuxOperatingSystemProfile.sshProfile.publicKeys[0].certificateFingerprint"
        ],
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Linux"
        }
      },
      "disableSshPasswordAuthentication": {
        "paths": [
          "properties.operatingSystemProfile.linuxOperatingSystemProfile.disableSshPasswordAuthentication"
        ],
        "require": false,
        "condition": {
          "name": "OS",
          "value": "Linux"
        }
      },
      "diskSalt": {
        "paths": [],
        "required": true
      },
      "extensions": {
        "paths": [
          "properties.extensions"
        ],
        "required": false,
        "action": "arraypush"
      },
      "dataDisks": {
        "paths": [
          "properties.storageProfile.dataDisks"
        ],
        "required": false,
        "action": "arraypush"
      },
      "endpoints": {
        "paths": [
          "properties.networkProfile.inputEndpoints"
        ],
        "required": false,
        "action": "arraypush"
      }
    },
    "resource": {
      "type": "Microsoft.ClassicCompute/virtualMachines",
      "properties": {
        "storageProfile": {
          "operatingSystemDisk": {
            "caching": "ReadWrite"
          }
        },
        "hardwareProfile": {
          "platformGuestAgent": "true"
        }
      }
    },
    "conditionals": {
      "OS": {
        "Windows": {
          "path": "properties.operatingSystemProfile.windowsOperatingSystemProfile",
          "resource": {
            "winRMListeners": [
              {
                "protocol": "Https"
              }
            ]
          }
        },
        "Linux": {
          "path": "properties.operatingSystemProfile.linuxOperatingSystemProfile",
          "resource": {
            "disableSshPasswordAuthentication": "true",
            "sshProfile": {
              "publicKeys": [
                {}
              ]
            }
          }
        },
        "LinuxPassword": {
          "path": "properties.operatingSystemProfile.linuxOperatingSystemProfile",
          "resource": {
            "disableSshPasswordAuthentication": "false"
          }
        }
      }
    },
    "computeds": [
      {
        "paths": [
          "properties.storageProfile.operatingSystemDisk.vhdUri"
        ],
        "template": "[concat({storageBlobEndpoint}, 'vhds/{domainName}-{resourceName}-os-{diskSalt}.vhd')]",
        "required": true
      },
      {
        "paths": [
          "properties.storageProfile.operatingSystemDisk.diskName"
        ],
        "template": "{domainName}-{resourceName}-os-{diskSalt}",
        "required": true
      },
      {
        "paths": [
          "properties.operatingSystemProfile.linuxOperatingSystemProfile.sshProfile.publicKeys[0].keyPath"
        ],
        "template": "/home/{adminUser}/.ssh/authorized_keys",
        "required": false,
        "condition": {
          "name": "OS",
          "value": "Linux"
        }
      }
    ]
  },
  "$schema": "https://gallery.azure.com/schemas/2014-06-01/gallerytemplate.json#"
}

module.exports.fragment = fragment;