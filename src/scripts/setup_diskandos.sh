#!/bin/bash

cat >> /etc/sysctl.conf <<EndCtl
vm.max_map_count = 131072
EndCtl

sysctl -p

mdadm --create --verbose /dev/md0 --level=0 --chunk=8 --raid-devices=16 /dev/sd[c-z]
mkfs.ext4 -T largefile -F /dev/md0

#sudo chown -R datastax:datastax /mnt/
mkdir -p /var/lib/cassandra

#Need to add real mount options and put this in fstab
echo -e "/dev/md0\t/var/lib/cassandra\text4\tdefaults,noatime\t0\t0" >> /etc/fstab
mount /var/lib/cassandra

