#!/bin/bash

# In the grand scheme of things, this is a pretty dangerous script.
# Normally one should only ever modify /etc/sudoers with a syntax
# checking tool like visudo. However, when dealing with a ton of
# disposable cloud servers, we can afford to live a little in the
# name of convenience.

# If you're feeling really adventurous and don't want to type "yes"
# every time you connect to a new host, add the following ssh opts:

# -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o  StrictHostKeyChecking=no

# This is an example, modify this script to suit your needs.
# In this example the group "datastax" is given NOPASSWD sudo.
# The "datastax" group was created at instance creation time.

APPDOMAIN=datastax-test.cloudapp.net
USERID=datastax
KEYFILE=~/.azurekeys/datastax-test.key

for nodeport in {10001..10050};
do
	ssh -t -i ${KEYFILE} ${USERID}@${APPDOMAIN} -p ${nodeport} 'echo -e "%datastax\tALL = (ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers'
done
