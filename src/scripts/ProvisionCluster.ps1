<#
.SYNOPSIS
Automatic provisioning of Cassandra test and load generatig clusters in Azure.

.EXAMPLE
 ProvisionCluster.ps1 -clusterType cassandra -nodes 30 -cloudServices 3 ...

Will provision Cassandra cluster with 90 nodes (3 x 30)

.EXAMPLE
 ProvisionCluster.ps1 -clusterType load -nodes 20 ...

Will provision Load cluster with 20 nodes.
#>

## Default settins can be configured in the param section below or using command line params.
param(
    [parameter(Mandatory=$true)]
    [string]
    ## Type of cluster. Specify 'cassandra' to start nodes for cassandra cluster or 'load' for load generation
    $clusterType,

    [string]
    ## AffinityGroup Name
    $affinityGroup = "CassandraTestGroup",

    [string]
    ## VNet Name
    $vnetName = "cassandra-test-vnet",

    [ValidateRange(1,50)]
    [parameter(Mandatory=$true)]
    [int]
    ## Number of Cassandra VMs per CloudService. Max 50.
    $nodes,

    [ValidateRange(1,10)]
    [int]
    ## Total number of Cassandra CloudServices (not applicable to Load cluster)
    $cloudServices = 1,

    [string]
    ## Instance Image
    $instanceImage = "5112500ae3b842c8b9c604889f8753c3__OpenLogic-CentOS-65-20140606",

    [ValidateSet("A0","A1","A2","A3","A4","A5","A6","A7","A8","A9")]
    [string]
    ## Instance Size
    $instanceSize = "A7",

    [string]
    ## SSH key certificate path. If you don't have .cer key, follow instructions here: http://azure.microsoft.com/en-us/documentation/articles/linux-use-ssh-key/
    $certPath = "..\certs\datastax-test.cer",

    [string]
    ## SSH key certificate fingerprint
    $certFP = "6316F4E5AA083390E615B13C85CAF1F11D47D4F6",

    [string]
    ## Linux username
    $linuxUser = "datastax",
    
    [string]
    ## Linux password
    $linuxPass = "Cassandra123",

    [string]
    ## Azure service names are global, use unique prefix for cloud services and storage accounts
    $uniquePrefix = "datastax"
)
## End of config

function ProvisionCassandraCluster()
{
    ## Add Storage Accounts.
    ## 1 storage account for each 2 instances. 2 instances can use 80-90% of IOPS limit of single storage account.
    for($i=1; $i -le ($nodes * $cloudServices / 2); $i++)
    {
        New-AzureStorageAccount -StorageAccountName "$($uniquePrefix)perftest$i" -Label "DataStax" -AffinityGroup $affinityGroup
    }

    ## Add Cassandra CloudService and VMs
    for($cs=1; $cs -le $cloudServices; $cs++)
    {
        $csName = "$($uniquePrefix)-perftest$cs"
        New-AzureService -ServiceName $csName -AffinityGroup $affinityGroup

        ## Add Certificate to the store on the cloud service (.cer or .pfx with -Password)
        Add-AzureCertificate -CertToDeploy $certPath -ServiceName "$csName"
     
        ## Create a certificate in the users home directory.
        $sshkey = New-AzureSSHKey -PublicKey -Fingerprint $certFP -Path '/home/datastax/.ssh/authorized_keys'
     
        for($i=1; $i -le $nodes; $i++)
        {
            ## Keep Instance Number sequential across CloudService accounts
            $instanceNumber = ($cs - 1) * $nodes + $i
            $sshPort = 10000 + $instanceNumber
     
            ## 2 nodes per storage account
            $storageContainer = "https://$($uniquePrefix)perftest$([math]::Ceiling($instanceNumber/2)).blob.core.windows.net/node$instanceNumber"
     
            ## Create new VM
            New-AzureVMConfig -Name "$csName-$instanceNumber" -ImageName $instanceImage -InstanceSize $instanceSize | `
                Add-AzureProvisioningConfig -Linux -LinuxUser $linuxUser -Password $linuxPass -SSHPublicKeys $sshKey -NoSSHEndpoint | `
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
}

function ProvisionLoadCluster()
{
    ## Add Stress Client CloudService
    $stressClientCSName = "$($uniquePrefix)-load"
    New-AzureService -ServiceName $stressClientCSName -AffinityGroup $affinityGroup
    Add-AzureCertificate -CertToDeploy $certPath -ServiceName $stressClientCSName
    $sshkey = New-AzureSSHKey -PublicKey -Fingerprint $certFP -Path '/home/datastax/.ssh/authorized_keys'

    ## Add Stress Client VMs
    for($i=1; $i -le $nodes; $i++)
    {
        $sshPort = 10000 + $i
     
        New-AzureVMConfig -Name "$stressClientCSName-$i" -ImageName $instanceImage -InstanceSize $instanceSize | `
            Add-AzureProvisioningConfig -Linux -LinuxUser $linuxUser -Password $linuxPass -SSHPublicKeys $sshKey -NoSSHEndpoint | `
            Add-AzureEndpoint -LocalPort 22 -Name 'SSH' -Protocol tcp -PublicPort "$sshPort" | `
            Set-AzureSubnet -SubnetNames "Subnet-1" | Set-AzureStaticVNetIP -IPAddress "10.1.20.$i" | `
            New-AzureVM -ServiceName $stressClientCSName -VNetName $vnetName
    }
}

function Usage()
{
    Write-Output ""
    Write-Output "For usage and examples type: 'Get-Help ProvisionCluster.ps1 -detailed'"
}

function InputInfo()
{
    Write-Output "Provisioning $clusterType cluster:"
    Write-Output "   Affinity Group:      $affinityGroup"
    Write-Output "   Virtual Network:     $vnetName"
    Write-Output "   Unique Prefix:       $uniquePrefix"
    Write-Output "   VM Image:            $instanceImage"
    Write-Output "   VM Size:             $instanceSize"
    Write-Output "   OS Username:         $linuxUser"
    Write-Output "   OS Password:         $linuxPass"
    Write-Output "   SSH Key Path:        $certPath"
    Write-Output "   SSH Key Fingerprint: $certFP"
}

try {
    ## Operation type
    if ($clusterType -eq "cassandra")
    {
        InputInfo
        Write-Output "   Nodes per CloudService: $nodes"
        Write-Output "   Total CloudServices:    $cloudServices"
        ProvisionCassandraCluster
    }
    elseif ($clusterType -eq "load")
    {
        InputInfo
        Write-Output "   Total nodes:         $nodes"
        ProvisionLoadCluster
    }
    else
    {
        Write-Output "Error: Unspecified or invalid operation type."
        Usage
    }
} catch [System.Exception] {
    Write-Host $_.Exception.ToString()
    Usage
    exit 1
}
