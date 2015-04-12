var customScript = require('./Fragments/ChildCustomScriptExtensionFragment').fragment
var dataDisk = require('./Fragments/DataDiskFragment').fragment
var domainName = require('./Fragments/DomainNameFragment').fragment
var endpoint = require('./Fragments/InputEndpointFragment').fragment
var cert = require('./Fragments/ServiceCertificateFragment').fragment
var storage = require('./Fragments/StorageAccountFragment').fragment
var vm = require('./Fragments/VirtualMachineFragment').fragment
var network = require('./Fragments/VirtualNetworkFragment').fragment

var fragments = {};
fragments[customScript.publisher + "_" + customScript.name] = JSON.stringify(customScript.content);
fragments[dataDisk.publisher + "_" + dataDisk.name] = JSON.stringify(dataDisk.content);
fragments[domainName.publisher + "_" + domainName.name] = JSON.stringify(domainName.content);
fragments[endpoint.publisher + "_" + endpoint.name] = JSON.stringify(endpoint.content);
fragments[cert.publisher + "_" + cert.name] = JSON.stringify(cert.content);
fragments[storage.publisher + "_" + storage.name] = JSON.stringify(storage.content);
fragments[vm.publisher + "_" + vm.name] = JSON.stringify(vm.content);
fragments[network.publisher + "_" + network.name] = JSON.stringify(network.content);

module.exports.fragments = fragments;      