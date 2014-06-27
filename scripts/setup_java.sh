#!/bin/bash

#This script copies the Java RPM file to the servers,
#removes any previously installed version and then
#installs the new Java RPM. Always use an Oracle JVM
#on production DSE or Cassandra clusters.

APPDOMAIN=datastax-test.cloudapp.net
USERID=datastax
KEYFILE=~/.azurekeys/datastax-test.key
JAVA_RPM=~/Downloads/jre-7u60-linux-x64.rpm

for nodeport in {10001..10050}; 
do 
	scp -P ${nodeport} -i ${KEYFILE} ${JAVA_RPM} ${USERID}@${APPDOMAIN}:
	ssh -t -i ${KEYFILE} ${USERID}@${APPDOMAIN} -p ${nodeport} 'sudo yum -y remove java*'
	ssh -t -i ${KEYFILE} ${USERID}@${APPDOMAIN} -p ${nodeport} "sudo yum -y install $(basename $JAVA_RPM)"
	ssh -i ${KEYFILE} ${USERID}@${APPDOMAIN} -p ${nodeport} 'java -version'

done
