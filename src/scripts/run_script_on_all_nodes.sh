#!/bin/bash

#This script copies the Java RPM file to the servers,
#removes any previously installed version and then
#installs the new Java RPM. Always use an Oracle JVM
#on production DSE or Cassandra clusters.

APPDOMAIN=datastax-perftest.cloudapp.net
USERID=datastax
KEYFILE=~/.azurekeys/datastax-test.key
SCRIPT=$1

for nodeport in {10001..10006}; 
do 
	scp -P ${nodeport} -i ${KEYFILE} ${SCRIPT} ${USERID}@${APPDOMAIN}:
	ssh -t -i ${KEYFILE} ${USERID}@${APPDOMAIN} -p ${nodeport} "chmod +x $SCRIPT; sudo ~/$SCRIPT"
done
