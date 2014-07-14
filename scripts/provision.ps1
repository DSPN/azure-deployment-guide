###### CONFIG SECTION ######
 
## AffinityGroup Name
$affinityGroup = "PerfTestGroup"
## VNET Name
$vnetName = "perftest-vnet"
## Number of Cassandra VMs per CloudService. Max 50.
$vmPerCloudService = 30
## Total number of Cassandra CloudServices
$totalCloudService = 2
## Number of Stress Client Nodes. Max 50.
$stressClientNodes = 15
## Instance Image
$instanceImage = "5112500ae3b842c8b9c604889f8753c3__OpenLogic-CentOS-65-20140606"
## Instance Size
$instanceSize = "A7"
 
###### END OF CONFIG ######
 
## Add Storage Accounts.
## 1 storage account for each 2 instances. 2 instances can use 80-90% of IOPS limit of single storage account.
for($i=1; $i -le ($vmPerCloudService * $totalCloudService / 2); $i++)
{
    New-AzureStorageAccount -StorageAccountName "datastaxperftest$i" -Label "DataStax" -AffinityGroup $affinityGroup
}
 
## Add Cassandra CloudService and VMs
for($cs=1; $cs -le $totalCloudService; $i++)
{
    $csName = "datastax-perftest$cs"
    New-AzureService -ServiceName $csName -AffinityGroup $affinityGroup
 
    ## Add Certificate to the store on the cloud service (.cer or .pfx with -Password)
    ## If you don't have .cer key, follow instructions here: http://azure.microsoft.com/en-us/documentation/articles/linux-use-ssh-key/
    Add-AzureCertificate -CertToDeploy 'C:\Users\rustam\Desktop\certs\datastax-test.cer' -ServiceName "$csName"
 
    ## Create a certificate in the users home directory. Fingerprint can be obtained form portal > cloud service > certificates
    $sshkey = New-AzureSSHKey -PublicKey -Fingerprint 6316F4E5AA083390E615B13C85CAF1F11D47D4F6 -Path '/home/datastax/.ssh/authorized_keys'
 
    for($i=1; $i -le $vmPerCloudService; $i++)
    {
        ## Keep Instance Number sequential across CloudService accounts
        $instanceNumber = ($cs - 1) * $vmPerCloudService + $i
        $sshPort = 10000 + $instanceNumber
 
        ## 2 nodes per storage account
        $storageContainer = "https://datastaxperftest$([math]::Ceiling($instanceNumber/2)).blob.core.windows.net/node$instanceNumber"
 
        ## Create new VM
        New-AzureVMConfig -Name "$csName-$instanceNumber" -ImageName $instanceImage -InstanceSize $instanceSize | `
            Add-AzureProvisioningConfig -Linux -LinuxUser "datastax" -Password "Cazzandra123" -SSHPublicKeys $sshKey -NoSSHEndpoint | `
            Add-AzureEndpoint -LocalPort 22 -Name 'SSH' -Protocol tcp -PublicPort "$sshPort" | `
            Set-AzureSubnet -SubnetNames "Subnet-1" | Set-AzureStaticVNetIP -IPAddress "10.1.1.$instanceNumber" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 0 -DiskLabel "disk1" -MediaLocation "$storageContainer/disk1.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 1 -DiskLabel "disk2" -MediaLocation "$storageContainer/disk2.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 2 -DiskLabel "disk3" -MediaLocation "$storageContainer/disk3.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 3 -DiskLabel "disk4" -MediaLocation "$storageContainer/disk4.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 4 -DiskLabel "disk5" -MediaLocation "$storageContainer/disk5.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 5 -DiskLabel "disk6" -MediaLocation "$storageContainer/disk6.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 6 -DiskLabel "disk7" -MediaLocation "$storageContainer/disk7.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 7 -DiskLabel "disk8" -MediaLocation "$storageContainer/disk8.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 8 -DiskLabel "disk9" -MediaLocation "$storageContainer/disk9.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 9 -DiskLabel "disk10" -MediaLocation "$storageContainer/disk10.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 10 -DiskLabel "disk11" -MediaLocation "$storageContainer/disk11.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 11 -DiskLabel "disk12" -MediaLocation "$storageContainer/disk12.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 12 -DiskLabel "disk13" -MediaLocation "$storageContainer/disk13.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 13 -DiskLabel "disk14" -MediaLocation "$storageContainer/disk14.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 14 -DiskLabel "disk15" -MediaLocation "$storageContainer/disk15.vhd" | `
            Add-AzureDataDisk -CreateNew -DiskSizeInGB 64 -LUN 15 -DiskLabel "disk16" -MediaLocation "$storageContainer/disk16.vhd" | `
            New-AzureVM -ServiceName $csName -VNetName $vnetName
    }   
}
 
## Add Stress Client CloudService
$stressClientCSName = "datastax-stresser"
New-AzureService -ServiceName $stressClientCSName -AffinityGroup $affinityGroup
Add-AzureCertificate -CertToDeploy 'C:\Users\rustam\Desktop\certs\datastax-test.cer' -ServiceName $stressClientCSName
$sshkey = New-AzureSSHKey -PublicKey -Fingerprint 6316F4E5AA083390E615B13C85CAF1F11D47D4F6 -Path '/home/datastax/.ssh/authorized_keys'
 
## Add Stress Client VMs
for($i=1; $i -le $stressClientNodes; $i++)
{
    $sshPort = 10000 + $i
 
    New-AzureVMConfig -Name "$stressClientCSName-$i" -ImageName $instanceImage -InstanceSize $instanceSize | `
        Add-AzureProvisioningConfig -Linux -LinuxUser "datastax" -Password "Cazzandra123" -SSHPublicKeys $sshKey -NoSSHEndpoint | `
        Add-AzureEndpoint -LocalPort 22 -Name 'SSH' -Protocol tcp -PublicPort "$sshPort" | `
        Set-AzureSubnet -SubnetNames "Subnet-1" | Set-AzureStaticVNetIP -IPAddress "10.1.20.$i" | `
        New-AzureVM -ServiceName $stressClientCSName -VNetName $vnetName
}
