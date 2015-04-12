module ExtensionCore.Network {
    export class IPv4Address {

        /**
        * The IPv4 Address. 
        * Should be a number array of length 4
        * ex: 192.168.1.0 => [192, 168, 1, 0]
        */
        public address: number[];

        /**
        * The number representation of the actual byte value of the entire address
        */
        public subnetBytes: number;

        /**
        * Creates a new instance of the IPv4Address class
        * This class is used to validate and work with IPv4 Addresses
        * @param address, a string of the address to create the class with.
        */
        constructor(address: string) {
            if (!address) {
                throw new ArgumentError("A non-null IP address is required");
            }

            this.address = address.split(".").map((token) => {
                return parseInt(token, 10);
            });

            this._validateIpValue();

            this._calculateByteValues();
        }

        /**
        * Prints a friendly representation of the IP Address
        * @returns string of the IPAddress segment of the Subnet (no prefix)
        */
        public toString(): string {
            return this.bytesToAddressString(this.subnetBytes);
        }

        /**
        * Checks that two IPs are equivalent.
        * @param rhs, The IP to check against this one.
        * @returns true if the IPs are identical
        */
        public equals(rhs: IPv4Address): boolean {
            return this.subnetBytes === rhs.subnetBytes;
        }

        /**
        * Checks that this IP is in a given range [startIp, endIp).
        * @param start, the first IP in the range
        * @param end, one after the last IP in the range
        * @returns true if the the IP is in the range [startIp, endIp)
        */
        public isIpInRange(start: IPv4Address, end: IPv4Address): boolean {
            return (start.subnetBytes <= this.subnetBytes && this.subnetBytes < end.subnetBytes);
        }

        public bytesToAddressString(bytes: number): string {
            return "{0}.{1}.{2}.{3}".format(
                ((bytes & 0xff000000) >>> 24),
                ((bytes & 0xff0000) >>> 16),
                ((bytes & 0xff00) >>> 8),
                ((bytes & 0xff) >>> 0));
        }

        private _validateIpValue() {
            if (this.address.length !== 4) {
                throw new ArgumentError("Malformed IP Address: {0}".format(this.address.join(".")));
            }

            this._validateOctet(0);
            this._validateOctet(1);
            this._validateOctet(2);
            this._validateOctet(3);
        }

        private _validateOctet(octet: number) {
            // The first octet is a special case
            // The first octet has to be at least 1
            if (isNaN(this.address[octet]) || this.address[octet] < (octet === 0 ? 1 : 0) || this.address[octet] > 255) {
                throw new ArgumentError("Octet {0} with value {1} is invalid. It must be between {2} and {3}".format(octet+1, this.address[octet], octet === 0 ? 1 : 0, 255));
            }
        }

        private _calculateByteValues() {
            this.subnetBytes = ((this.address[0] << 24) >>> 0 | (this.address[1] << 16) >>> 0 | (this.address[2] << 8) >>> 0 | (this.address[3] << 0) >>> 0) >>> 0;
        }
    }
}