# Best Practices

This section of the deployment guide covers recommendations for compute, storage, network and more.

## General

### Azure Resource Manager

Microsoft is currently on the second iteration of Azure.  The first iteration is now called classic deployment.  This is also known as Azure Service Management (ASM) and makes use of the web interface at https://manage.windowsazure.com/  We do not recommend classic deployment.  Neither Microsoft nor DataStax are investing resources in it.

We recommend all deployments use Azure Resource Manager (ARM).  This is Microsoft's latest deployment mechanism.  It makes use of the Azure Portal at http://portal.azure.com  ARM features numerous enhancements over ASM.  These range from parallel deployments rather than series (cutting deployment times from days/weeks to minutes/hours), availability sets (for better high availability and rack awareness) to a restructuring of the fundamental deployment model.

If you have an existing Azure deployment that already makes use of ASM, it is possible to create new resources in ARM.  We recommend this rather than adding to an existing ASM implementation.

More information is available [here](https://azure.microsoft.com/en-us/documentation/articles/resource-manager-deployment-model/).

## Compute

### Recommended Machine Types

The minimal recommended config for DataStax Enterprise is 2 cores, 8GB RAM and 80GB of disk.  Those recommendations are given [here](http://docs.datastax.com/en/latest-dse/datastax_enterprise/install/installDEBdse.html).

### D and G Series

Most of our work on Azure to date has relied on instances with ephemeral storage.

A series instances use a spinning disk for ephemeral storage. DataStax does not recommend A series machines for any DSE application.

D, D v2 and G series machines all use SSD drives for their ephemeral storage.  We understand Microsoft is phasing out the D series v1 machines, so do not recommend them for new deployments.

We find that the following D series v2 machines have a good mix of resources for general DSE applications:

* D4 v2
* D5 v2
* D13 v2
* D14 v2

For most production applications we recommend a D14 v2 as it makes use of the entire underlying physical machine and its 800GB ephemeral SSD is well sized for many DSE applications.

A D13 is physically 1/2 of a D14 and a D12 1/4. Using the entire machine avoids resource contention issues. Like the D14, the D5 is also the entire machine, but relative prices typically make the D14 more appealing.

Smaller D series boxes such as the D2 v2 are great for testing out deployments but we would not recommend them for production use.

F series machines have ephemeral SSD drives, but those drives are relatively small.  Given the small size we do not recommend deploying DSE on an F series machine as it will not be a cost effective solution.

G series machines are well suited to memory intensive workloads such as Graph, Spark and Solr. For such workloads the following instances are recommended, though larger D series may suffice as well.  We recommend the following G series machines:

* G4
* G5

More information on Azure instance types is available (here)[https://azure.microsoft.com/en-us/pricing/details/virtual-machines/#Linux].  Note that Linux instances are significantly less expensive than their Windows counterparts.

### DS, FS and GS Series

D , F and G series machines are also available as DS, FS and GS series boxes. The S boxes are physical identical to their non-S brethren, but use part of the ephemeral SSD as a cache for Premium Storage. In the case of a DS14, the 800GB SSD is split into a 224GB ephemeral and a 576GB cache.

Premium Storage is a network attached, SSD based storage. It comes in three flavors, P10, P20 and P30. Performance for the drive increases with its size, so P30 is both the largest at 1TB and most performant with 5000IOPS. Given the marginal cost differential between P10, P20 and P30 we recommend P30 for all Premium Storage applications.

We caution against attaching a large number of P30s to a single VM as both performance and rebuild times will suffer. The closer the size of the attached premium storage is to the size of the host machine’s ephemeral cache, the better your performance will be.

We recommend the following machines for Premium Storage based applications:

* DS4 v2
* DS5 v2
* DS13 v2
* DS14 v2
* FS8
* FS16
* GS4
* GS5

## Storage

### Storage Accounts

Storage accounts come in two flavors: standard and premium.  Standard storage is network attached and based on spinning magnetic disks.  Premium storage is network attached and based on SSD.  Premium storage can only be used as the file system with the S series machines.  We have heard that it's possible to attached premium storage to other machines but only as a blob store, not as a filesystem.

#### Standard Storage

Standard storage can be attached to any Azure machine.  We recommend using Standard Storage for OS disks.  We strongly recommend against using standard storage as the data disk for any DSE application.

Each standard storage account supports up to 20,000 IOPS. A standard storage disk has a maximum of 500 IOPS.  20,000 IOPS / 500 IOPS = 50, so if you attach more than 40 disks to a single storage account, the storage account will be over provisioned. The result will be kernel panics and other low level failures of the OS.

If using D or G series machines only standard disks and the local ephemeral disks are available.  In that case we recommend using the standard disk for the OS disk and the ephemeral disk at the data disk.  For D and G series machines it typically makes sense to share storage accounts across machines as only one drive is attached to the machine and managing that layout is relatively simple.

40 machines require 40 distinct OS disks and one standard storage account.  41 machines would require two standard storage accounts as implied by the IOPS arithmetic above.

### Premium Storage

Premium storage accounts are limited by attached size of the drives rather than IOPS.  A premium storage account can have up to 35TB of attached storage.  Premium storage comes in three sizes, with additional size giving additional performance as shown in the chart below from here.  The number of drives that can be attached to a given machine depend on its size.  For instance, a DS14 can have up to 32 P30 drives attached.  More information on that is available here.

| Premium Storage Disk Type | P10               | P20               | P30               |
|---------------------------|-------------------|-------------------|-------------------|
| Disk size                 | 128 GiB           | 512 GiB           | 1024 GiB          |
| IOPS per disk	            | 500               | 2300	            | 5000              |
| Throughput per disk	    | 100 MB per second	| 150 MB per second	| 200 MB per second |

If using an S series machine, either premium or standard storage can be used for the OS disk.  From discussions with Microsoft we understand Premium Storage is both more reliable and more performant.  If you chose to use Premium Storage for the OS disk, a P10 drive is sufficient for OS disk applications.  We recommend P30 disks for all data disk applications.  Multiple P30 disks can be attached to a single machine in a RAID 0 configuration to improve I/O performance.  

That said, thought should be given to node density.  1TB of data per node is typically a sweet spot in DataStax performance.  Configurations such as 2xP30 with only 500GB used on each drive and the remainder reserved for compaction with give a good balance of node density, rebuild time and compaction space.  Similarly 4xP30 with 250GB on each drive will perform well.

We advise against configurations where large amounts of data (for instance 10TB) is stored on each node.  This will lead to long rebuild times and compromised availability.

To simplify management of storage accounts and dependencies between nodes, we recommend a premium storage account per node when using Premium Storage.  Azure has a 100 storage account per subscription quota by default on EA accounts.  This can be raised by contacting Azure support.

Performance on premium storage is banded into 50ms windows.  A little arithmetic shows that: 1 sec / 50 ms = 20 windows/second.  5000IOPS/sec / 20 windows/second = 250 IOPS/window.  IOPS beyond what a window can support are queued.

If you are using more than one Premium Storage disk, either RAID-0 or JBOD can be used.  We recommend RAID-0 for now, though expect JBOD to become preferred as some changes are made to DataStax Enterprise.

## Network

### Multi Data Center

One of the best things about DataStax Enterprise is its ability to continue running even after the loss of one or more data centers. Azure provides more regions than any other cloud provider, making Azure a great place to deploy DataStax Enterprise.

VMs deployed in Azure must each be assigned a private IP address. That address belongs to a NIC that belongs to a vnet. Vnets, in turn belong to a region. Private IP addresses are not routable across regions by default. Instead, the network must be configured to route traffic across vnets.

Azure provides three options to accomplish that:

* Public IP Addresses
* VPN Gateway
* Express Route

For most applications we suggest using public IP addresses. More detail on each option is given below.

### Public IP Addresses

Each node in a cluster can be assigned a public IP address. That DataStax Enterprise cluster can then be configured to communicate using those public IPs. Traffic between public IPs in Azure is routed over the Azure backbone, with bandwidth in the 10-100s of Gbps.  As such, bandwidth is theoretically limited by the bandwidth cap on the virtual machine.  In general bandwidth caps are higher the larger the virtual machine.  In testing, we have seen throughput ranging from 2-6 Gbps on a machine with an 8 Gbps bandwidth cap.

Public IPs can be either dynamic or static.  Static IPs are reserved indefinitely.  A dynamic IP is reserved when attached to a machine.  The dynamic IP remains assigned indefinitely through reboots and even hardware failures of the machine.  It will only be reassigned if the machine is stopped or deleted.  We understand the name "dynamic" gives some reservations, but given their characteristics, dynamci public IPs are suitable for almost all DataStax applications.

Network Security Groups can be configured to prevent outside access to the nodes, ensuring that the public IPs are only used for routing traffic between nodes.

Given the extremely high bandwidth and relatively low cost of this option, we recommend it for the majority of multi-datacenter clusters.

### VPN Gateway

VPN Gateways come in two flavors, a standard gateway and a high performance gateway. The high performance gateway has a theoretical bandwidth of 200Mbps. In practice rates in the mid 150Mbps have been observed. Given the low bandwith we do not typically recommend VPN gateways for DataStax clusters.

Additionally, the setup of VPN gateways is extremely complex. A gateway must be created in every vnet you wish to connect. Then uni-directional connections must be created between each gateway. For a cluster with n datacenters, n*(n-1) connections must be created.  Deployment times for a VPN gateway can be as much as an hour.  Connections typically take only a few minutes to establish once the gateways are in place.

Each VPN gateway is made up of two Azure machines deployed as a fault tolerant pair.  

### Express Route

Express Route is a leased circuit.  Microsoft partners with vendors including CenturyLink and Equinix to provide Express Route.  Express Route requires the creation of gateways and connections as in the VPN Gateway model, however the maximum bandwidth is greater. Express Route bandwidth ranges from 50Mbps to 10Gbps.

Express Route requires the user have an Express Route circuit in place as well. That has a monthly cost in addition to an other Azure charges.  The cost varies depending on the bandwidth.  Information on that is available at https://azure.microsoft.com/en-us/pricing/details/expressroute/

We recommend Express Route for cases where an on-prem datacenter must be connected to Azure.

We have serious reservations about using Express Route in a pure cloud multi-dc scenario.  Express Route requires a circuit that has a specific geopgraphic location.  Suppose that you have two data centers, Azure East and Azure West, with a circuit in Kansas City.  All traffic between your two data centers will route through Kansas City.  In that case, the latency hit of the extra hop will likely be acceptable.  However, suppose you now add datacenters in London and Berlin.  In this case, all traffic between London and Berlin will now be routed through Kansas City.  In this case, there is a clear advantage to using public IPs.

The fastest Express Route link available is 10 Gbps.  That is the entire link and all nodes in the cluster as well as any other applications deployed that use the same Express Route circuit will all contend for that bandwidth.  Contrast that with the public IP scenario where each node has its own dedicated public IP for communication.

Additionally, DataStax is based on a true peer to peer architecture.  Funneling that architecture through gateways based on a fault tolerant gateway pair mitigates some advantages of that peer to peer architecture.

### Rack Awareness

In DataStax Enterprise replicas should be placed in different racks to ensure that multiple replicas are not lost due to a hardware failure that is confined to a portion of a physical data center. On Azure this is typically accomplished by configuring GossipingPropertyFileSnitch.

To configure the snitch, the corresponding Azure resources must be configured. We recommend configuring an availability set for the VMs in each logical data center you define. The availability set should have the number of fault domains set to 3 and upgrade domains should be set to 20.

Azure supports a maximum of 3 fault domains and 20 upgrade domains.  We recommend the maximum number of upgrade domains as that will minimize the number of nodes down at any one time, hence the recommended setting of 20 upgrade domains.

It's possible to set the number of fault domains to 1 or 2.  Doing that will result in lower availability that setting the number of fault domains to 3.  This is because a fault domain failure will result in a loss of either 100% or 50% of your nodes.  Given that, a fault domains should always be set to 3.

You can read more about Azure availability sets here.

With your availability sets created, the next step is to map those to DataStax Enterprise racks. This can be done by calling the Azure metadata service from each node. That will return the fault domain and upgrade domain the node belongs to. That information can then be included in the node’s rack configuration file.

Azure attempts to spread nodes across FDs and UDs evenly.  An example of how that is done is given in the table below.

|      | FD 1 | FD 2 | FD 3 |
|------|------|------|------|
| UD 1 | 1    |	5	 | 9    |
| UD 2 | 10	  | 2	 | 6    |
| UD 3 | 7	  | 11	 | 3    |
| UD 4 | 4	  | 8	 | 12    |

Given this node placement, a desireable rack placement is:

|      | FD 1 | FD 2 | FD 3 |
|------|------|------|------|
| UD 1 | 1    |	2    | 3    |
| UD 2 | 3	  | 1	 | 2    |
| UD 3 | 2	  | 3	 | 1    |
| UD 4 | 1	  | 2	 | 3    |

To map to racks, we need to create a function that maps the FD and UD of a node to a rack.  Replicas should be placed in different FDs and UDs to ensure that a UD or FD failure does not cause more than one replica to be lost.  Additionally, the function needs to distribute uniformly across FD and UD to ensure that racks have the same number of nodes.

One function that meets these requirements is f(UD,FD) = ???

The idea of creating an Azure specific snitch has been proposed.  We are not currently pursuing that as GossipingPropertyFileSnitch is better understood and more widely used than any cloud specific snitch.  In fact, we typically recommend GossipingPropertyFileSnitch rather than the Google or Amazon specific snitches while operating in those clouds.

### Cluster Connectivity

The ARM templates currently configure public IPs for every node.  Any node can be accessed via those public IPs, or within a vnet via their private IP.  This IP can be used to access the node via a wide array of tools include DevCenter, OpsCenter, cqlsh and nodetool.  Care should be taken the secure the deployment to your specifications.
