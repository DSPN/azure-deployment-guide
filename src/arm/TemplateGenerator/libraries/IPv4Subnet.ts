/// <reference path="IPv4Address.ts" />

module ExtensionCore.Network {
    export class IPv4Subnet extends IPv4Address {

        /**
        * The IPv4 Subnet Prefix. 
        * Should be a number between 1 and 32
        */
        public prefix: number;

        /**
        * The number representaiton of the actual byte value of the subnet Net mask
        */
        public subnetNetMaskBytes: number;

        /**
        * The number representaiton of the actual byte value of the subnet mask
        */
        public subnetMaskBytes: number;

        /**
        * The number representaiton of the actual byte value of the subnet's broadcast address
        */
        public subnetBroadcastAddressBytes: number;

        /**
        * Creates a new instance of the IPv4Subnet class
        * This class is used to validate and work with IPv4 Subnets
        * @param subnetCidr, a string of the subnet to create the class with. Accepted values are IP, or IP/Prefix
        */
        constructor(subnetCidr: string) {
            if (!subnetCidr) {
                throw new ArgumentError("A non-null subnet address is required");
            }

            var subnetTokens = subnetCidr.split("/");
            // Assume the user passed in a simple IP Address. Give them a prefix of 32 because we're nice
            if (subnetTokens.length === 1) {
                this.prefix = 32;
            } else if (subnetTokens.length > 2) { // Too many slashes!
                throw new ArgumentError("Malformed Subnet Address. Address was: {0}".format(subnetCidr));
            } else {
                this.prefix = parseInt(subnetTokens[1], 10);
            }

            super(subnetTokens[0]);

            this._validatePrefix();
            this._calculateSubnetByteValues();
        }

        /**
        * Prints a friendly representation of the IP Subnet
        * @returns string of the entire subnet, including the prefix
        */
        public toString(): string {
            return "{0}/{1}".format(super.toString(), this.prefix)
        }

        /**
        * Prints a friendly representation of the IP Address
        * @returns string of the IPAddress segment of the Subnet (no prefix)
        */
        public toAddressString(): string {
            return super.toString();
        }

        /*
        * Determines if another subnet is completely contained in this subnet
        * @param subnet IPv4Subnet the other subnet to test
        * @returns boolean. true if the other subnet is completely contained in this subnet. false otherwise.
        */
        public isOtherSubnetContained(subnet: IPv4Subnet): boolean {
            return (this.prefix <= subnet.prefix) && ((this.subnetNetMaskBytes & subnet.subnetBroadcastAddressBytes) >>> 0) === this.subnetMaskBytes;
        }

        /**
        * Determines if another subnet overlaps this one
        * @param subnet IPv4Subnet the other subnet to test
        * @returns boolean. true if the two subnets overlap with eachother. false otherwise
        */
        public doesSubnetOverlap(subnet: IPv4Subnet): boolean {
            return !this.isOtherSubnetContained(subnet) && !subnet.isOtherSubnetContained(this);
        }

        /**
        * Returns a string representation of the first IP in this range, exlucding the offset
        * @param offset optional offset for the beginning of the range. This is a count of addresses not included in the range
        * @returns string of the starting IP address in the range plus the offset
        */
        public getFirstAddressInRange(offset?: number): string {
            return this.bytesToAddressString(((this.subnetBytes & this.subnetNetMaskBytes) >>> 0) + (offset ? offset : 0));
        }

        /**
        * Returns a string representation of the last IP in this range, exlucding the offset
        * @param offset optional offset for the end of the range. This is a count of addresses not included in the range
        * @returns string of the last IP address in the range less the offset
        */
        public getLastAddressInRange(offset?: number): string {
            return this.bytesToAddressString(this.subnetBroadcastAddressBytes - (offset ? offset : 0));
        }

        /**
        * Checks that this IP is in a subnet.
        * @param subnet, the subnet to check that this IP is in
        * @returns true if this IP is in the subnet
        */
        public doesContainIp(ip: IPv4Address): boolean {
            var thisIp = new IPv4Subnet(ip.toString());
            return (this.isOtherSubnetContained(thisIp));
        }

        /**
        * Returns a string representation of the IP Range for the subnet
        * @param beginOffset optional offset for the beginning range. This is a count of addresses not included in the range
        * @param endOffset optional offset for the end of the range. This is the count of address not included in the range
        * @returns string in the format of [StartingAddress + beginOffset] - [EndingAddress - endOffset]
        */
        public getSubnetRange(beginOffset?: number, endOffset?: number): string {
            return "{0} - {1}".format(this.getFirstAddressInRange(beginOffset), this.getLastAddressInRange(endOffset));
        }

        /**
        * Returns a number of usable ip addresses for this subnet
        * @param beginOffset optional offset for the beginning range. This is a count of addresses not included in the range
        * @param endOffset optional offset for the end of the range. This is the count of address not included in the range
        * @returns number of usable address in the range, not including the offsets.
        */
        public getUsableIpAddressCount(beginOffset?: number, endOffset?: number): number {
            // We take the entire range not counting the broadcast address
            // Then remove the begin offset and the end offset
            beginOffset = beginOffset ? beginOffset : 0;
            endOffset = endOffset ? endOffset : 0;
            return this.subnetBroadcastAddressBytes - this.subnetBytes - beginOffset - endOffset + 1;
        }

        /**
        * Gets a child subnet that is contained in this subnet of the given size
        * @param prefix The prefix to create the child subnet. Uses the parent address space prefix if none is provided
        * @returns A child IPv4Subnet that is contained in the parent subnet
        */
        public getChildSubnet(prefix?: number): IPv4Subnet
        public getChildSubnet(prefix?: string): IPv4Subnet
        public getChildSubnet(prefix?: any): IPv4Subnet {
            var prefixToUse = this._getUsablePrefix(prefix, true);

            return new IPv4Subnet(this.getFirstAddressInRange() + "/" + prefixToUse);
        }

        /**
        * Gets the nth IP Address in this subnet
        * @param offset The offset of how many ip addresses to give. 0 by default
        * @returns A string of the ip address
        */
        public getIpAddress(offset?: number): string {
            var offsetToUse = offset ? offset : 0;

            if (this.getUsableIpAddressCount() < offsetToUse) {
                throw new ArgumentError("offset", "The requested IP Address is not in this subnet");
            }

            return this.bytesToAddressString(this.subnetBytes + offsetToUse);
        }

        /**
        * Gets a new subnet that immediately follows the current subnet
        * @param prefix The prefix to create the new subnet. Uses the this prefix if none is provided
        * @returns The next IPv4Subnet that follows this subnet
        */
        public getNextSubnet(prefix?: number): IPv4Subnet
        public getNextSubnet(prefix?: string): IPv4Subnet
        public getNextSubnet(prefix?: any): IPv4Subnet {
            var prefixToUse = this._getUsablePrefix(prefix, false);

            // Find the next IP address after this range
            var address: string;
            if (prefixToUse < this.prefix) {
                var tempSubnet = new IPv4Subnet(this.toAddressString() + "/" + prefixToUse);
                address = tempSubnet.bytesToAddressString(tempSubnet.subnetBroadcastAddressBytes + 1);
            } else {
                address = this.bytesToAddressString(this.subnetBroadcastAddressBytes + 1);
            }

            return new IPv4Subnet(address + "/" + prefixToUse);
        }

        private _getUsablePrefix(prefix: any, checkLength: boolean): number {
            var prefixToUse = this.prefix;
            if (prefix) {
                if (typeof prefix === "string") {
                    prefix = parseInt(prefix, 10);
                }

                if (checkLength && prefix < this.prefix) {
                    throw new ArgumentError("prefix", "The supplied prefix was smaller than the parent. It must be greater than or equal to the parent");
                }

                prefixToUse = prefix;
            }

            return prefixToUse;
        }

        /**
        * Given a list of existing Subnet ranges, finds a subnet with the desired prefix that does not overlap with any of them
        * @param existingSubnets an array of strings in the format address/prefix. This is the existing space you wish not to overlap with
        * @param desiredPrefix the size of the gap you wish to find. Valid prefixes are 1-32
        * @param privateOnly optional boolean. If true, it will limit the result to only Subnets in the private space
        * @returns an IPv4Subnet class of the desired size, which does not overlap any of the existing subnets. Null if no gap was found
        */
        public static findSubnetGap(existingSubnets: string[], desiredPrefix: number, privateOnly?: boolean): IPv4Subnet
        /**
        * Given a list of existing Subnet ranges, finds a subnet with the desired prefix that does not overlap with any of them
        * @param existingSubnets an array of IPv4Subnets. This is the existing space you wish not to overlap with
        * @param desiredPrefix the size of the gap you wish to find. Valid prefixes are 1-32
        * @param privateOnly optional boolean. If true, it will limit the result to only Subnets in the private space
        * @returns an IPv4Subnet class of the desired size, which does not overlap any of the existing subnets. Null if no gap was found
        */
        public static findSubnetGap(existingSubnets: IPv4Subnet[], desiredPrefix: number, privateOnly?: boolean): IPv4Subnet
        public static findSubnetGap(existingSubnets: any[], desiredPrefix: number, privateOnly?: boolean): IPv4Subnet {
            if (!existingSubnets) {
                throw new ArgumentError("existingSubnets", "existingSubnets must not be null");
            }

            if (desiredPrefix < 1 || desiredPrefix > 32) {
                throw new ArgumentError("desiredPrefix", "The subnet prefix must be between 1 and 32");
            }

            // If there are no other subnets to find a gap for, return the default space using the desired prefix
            if (existingSubnets.length === 0) {
                return new IPv4Subnet("10.0.0.0/" + desiredPrefix.toString());
            }

            var subnets: IPv4Subnet[];
            // IF they sent in a string array, convert them all to IPv4Subnets
            if (typeof (existingSubnets[0]) === "string") {
                subnets = (<string[]>existingSubnets).map((address) => {
                    return new IPv4Subnet(address);
                });
            } else {
                subnets = <IPv4Subnet[]>existingSubnets;
            }

            // Sort the subnets by their broadcast address
            subnets.sort((left, right) => {
                return left.subnetBroadcastAddressBytes < right.subnetBroadcastAddressBytes ? -1 : 1;
            });

            var eliminatedIndices: number[] = [];
            for (var i = 0; i < subnets.length; i++) {
                var isIndexEliminated = eliminatedIndices.first((val) => {
                    return val === i;
                });

                if (!isIndexEliminated) {
                    for (var j = 0; j < subnets.length; j++) {
                        if (i !== j && subnets[i].isOtherSubnetContained(subnets[j])) {
                            eliminatedIndices.push(j);
                        }
                    }
                }
            }

            var filteredSubnets = subnets.filter((s, index) => {
                var eliminated = eliminatedIndices.first((val) => {
                    return val === index;
                });

                return eliminated === null;
            });

            // Special case 10.0.0.0/desiredPrefix. If it fits, use it
            var testSubnet = new IPv4Subnet("10.0.0.0/" + desiredPrefix);
            if (testSubnet.subnetBroadcastAddressBytes < filteredSubnets[0].subnetBytes) {
                return testSubnet;
            }

            var result: IPv4Subnet;
            var privateA = new IPv4Subnet("10.0.0.0/8");
            var privateB = new IPv4Subnet("172.16.0.0/12");
            var privateC = new IPv4Subnet("192.168.0.0/16");
            for (var i = 0; i < filteredSubnets.length; i++) {
                var leftSubnet = filteredSubnets[i].prefix > desiredPrefix ? new IPv4Subnet(filteredSubnets[i].toAddressString() + "/" + desiredPrefix.toString()) : filteredSubnets[i];
                var rightSubnet = i + 1 < filteredSubnets.length ? filteredSubnets[i + 1] : null;

                if ((rightSubnet === null) || (rightSubnet.subnetBytes - leftSubnet.subnetBroadcastAddressBytes >= Math.pow(2, 32 - desiredPrefix))) {
                    result = new IPv4Subnet(leftSubnet.bytesToAddressString(leftSubnet.subnetBroadcastAddressBytes + 1) + "/" + desiredPrefix);

                    // If we only want private, we need to add another check, and cycle if it doesnt fit
                    if (privateOnly) {
                        if (privateA.isOtherSubnetContained(result) || privateB.isOtherSubnetContained(result) || privateC.isOtherSubnetContained(result)) {
                            return result;
                        } else {
                            // If we are at the last address, we should still try to find an existing item within the private space
                            if (rightSubnet === null) {
                                // If we are less than A, shift to A
                                if (result.subnetBroadcastAddressBytes < privateA.subnetBytes) {
                                    if (desiredPrefix >= 8) {
                                        return new IPv4Subnet("10.0.0.0/" + desiredPrefix);
                                    } else {
                                        return null;
                                    }
                                }
                                // If we are between A and B, shift to B
                                if (result.subnetBytes > privateA.subnetBroadcastAddressBytes && result.subnetBroadcastAddressBytes < privateB.subnetBytes) {
                                    if (desiredPrefix >= 12) {
                                        return new IPv4Subnet("172.16.0.0/" + desiredPrefix);
                                    } else {
                                        return null;
                                    }
                                }

                                // If we are between B and C, shift to C
                                if (result.subnetBytes > privateB.subnetBroadcastAddressBytes && result.subnetBroadcastAddressBytes < privateC.subnetBytes) {
                                    if (desiredPrefix >= 16) {
                                        return new IPv4Subnet("192.168.0.0/" + desiredPrefix);
                                    } else {
                                        return null;
                                    }
                                }
                            }
                        }
                    } else {
                        return result;
                    }
                }
            }
        }

        private _validatePrefix() {
             if (this.prefix < 1 || this.prefix > 32) {
                throw new ArgumentError("Prefix", "The subnet prefix must be between 1 and 32")
             }
        }

        private _calculateSubnetByteValues() {
            this.subnetNetMaskBytes = (0xffffffff << (32 - this.prefix)) >>> 0;
            this.subnetMaskBytes = (this.subnetNetMaskBytes & this.subnetBytes) >>> 0;
            this.subnetBroadcastAddressBytes = (((this.subnetNetMaskBytes ^ 0xffffffff) >>> 0) | this.subnetBytes) >>> 0;
        }
    }
}