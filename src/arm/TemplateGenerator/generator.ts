/// <reference path="extensioncore.d.ts" />
function generateTemplate(data: any, fragmentStrings: {[key: string]: string}): string {
    var factory = new ExtensionCore.Csm.TemplateFactory();
    var vmFragment = new ExtensionCore.Csm.Fragment<any>(fragmentStrings["Microsoft_VirtualMachineFragment"]);
    vmFragment.parameters.diskSalt = ((new Date()).getTime()).toString();
    vmFragment.parameters.resourceName = "VMName";
    vmFragment.parameters.resourceLocation = "WestUS";
    vmFragment.parameters.apiVersion = "2014-06-01";    

    vmFragment.parameters.adminUser = "Username";
    vmFragment.parameters.adminPassword = "Password";
    vmFragment.setConditional("OS", "Linux");
    vmFragment.parameters.disableSshPasswordAuthentication = "false";

    //vmFragment.parameters.hardwareSize = "Small";
    setSizeToSmall(vmFragment);
    vmFragment.parameters.domainNameResourceId = "Resource Id";
    vmFragment.parameters.domainName = "domainnameurl";
    vmFragment.parameters.storageBlobEndpoint = "storage endpoint.com"

    vmFragment.parameters.mediaName = "a9ds8f7987298_pathto.vhd";
    factory.addFragment(vmFragment);
    return factory.generateTemplate();
}

function setSizeToSmall(fragment: ExtensionCore.Csm.Fragment<any>) {
    fragment.parameters.hardwareSize = "Small"
}