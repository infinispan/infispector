#!/bin/bash

#colors
NC='\033[0m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
RED='\033[0;31m'

if [ "$#" -eq "0" ] || [ $1 == "help" ]
then
printf "
  _____          __  _                          _ 
 |_   _|        / _|(_)                        | |              
   | |   _ __  | |_  _  ___  _ __    ___   ___ | |_   ___   _ __ 
   | |  | '_ \ |  _|| |/ __|| '_ \  / _ \ / __|| __| / _ \ | '__|
  _| |_ | | | || |  | |\__ \| |_) ||  __/| (__ | |_ | (_) || |   
 |_____||_| |_||_|  |_||___/| .__/  \___| \___| \__| \___/ |_|   
                            | |                                 
                            |_|                                 


commands:
${GREEN}infispector${NC} or ${GREEN}infispector help${NC} - prints this help
${GREEN}infispector prepare${NC} - starts dependecies (zookeeper, kafka, druid)
${GREEN}infispector start${NC} - starts application
${GREEN}infispector nodes${NC} - starts 4 instances
${GREEN}infispector nodes ${RED}NUMBER${NC} - starts specified ${RED}NUMBER${NC} of instances
"
	exit 0
fi

#paths
DRUID_LOCATION=`find /home -type d -name druid-0.8.3 2> /dev/null`
KAFKA_LOCATION=`find /home -type d -name kafka_2.10-0.8.2.0 2> /dev/null`
INFISPECTOR_LOCATION=`find /home -type d -iname infispector 2> /dev/null | awk '{ print length, $0 }' | sort -n -s | head -n1 | cut -f 2 -d ' '`

DEFAULT="4"
NUMBER_CHECK='^[0-9]+$'
cnt="0"
TIMEOUT="0"

if [ -z $DRUID_LOCATION ]
then
	printf "Druid not found. Druid must be in /home/* directory\n" >&2
	exit 1
fi

if [ -z $KAFKA_LOCATION ]
then
	printf "Kafka not found. Kafka must be in /home/* directory\n" >&2
	exit 1
fi

if [ -z $INFISPECTOR_LOCATION ]
then
	printf "Infispector not found. Infispector must be in /home/* directory\n" >&2
	exit 1
fi

if [ $EUID -eq 0 ]
then
	printf "Please, run this as a ${WHITE}normal${NC} user, not root.\n" >$2
	exit 1
fi

if [ "$#" -gt "2" ] || { [ "$#" -eq "2" ] && [ "$1" != "nodes"  ]; }
#if [ \( "$#" -gt "2" \) -o \( "$g" "$#" -eq "2" -a "$1" -ne "nodes" \) ]
then
	printf "Invalid number of arguments!\n" >$2
	exit 1
fi


if [ $1 == "prepare" ]
then
	cd $KAFKA_LOCATION
	printf "Starting zookeeper ...."
	bin/zookeeper-server-start.sh config/zookeeper.properties > /dev/null &
	if [ $? -ne 0 ]
	then
		printf " ${RED}FAIL${NC}\n"
		exit 1
	else
		printf " ${GREEN}OK${NC}\n"
	fi
	printf "Starting kafka ...."
	bin/kafka-server-start.sh config/server.properties > /dev/null &
	if [ $? -ne 0 ]
	then
		printf " ${RED}FAIL${NC}\n"
		exit 1
	else
		printf " ${GREEN}OK${NC}\n"
	fi

	cd $DRUID_LOCATION
	printf "Starting druid ...."
	java -Xmx512m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -Ddruid.realtime.specFile=$INFISPECTOR_LOCATION/kafka_druid_infrastructure/infispectorDruid.spec -classpath "config/_common:config/realtime:lib/*" io.druid.cli.Main server realtime > log.txt 2> log_err.txt &
	while true
	do
		if cat log.txt | grep "Firehose acquired!" > /dev/null
		then
			break
		fi
		if [ $TIMEOUT -eq "10" ]
		then
			printf " ${RED}FAIL${NC}\n"
			exit 1
		fi
		TIMEOUT=$[$TIMEOUT + 1]
		sleep 1		
	done
	printf " ${GREEN}OK${NC}\n"
	printf "Infispector is ready to be started!\n"
	exit 0
fi

if [ $1 == "start" ]
then
	cd $INFISPECTOR_LOCATION
	grunt
	exit 0
fi

if [ $1 == "nodes" ]
then
	if ! [[ -z "$2" ]]
	then
		if ! [[ $2 =~ $NUMBER_CHECK ]]
		then
			printf "Second argument must be a number\n" >&2
			exit 1
		fi
		DEFAULT=$2
		if [ $DEFAULT -ge "10" ]
		then
			while true;
			do
				read -p "Are you sure you want to start ${DEFAULT} instances? [y/n] " yn
				case $yn in
					[Yy]* ) break;;
					[Nn]* ) exit 0;;
					*) echo "Please answer y or n.";;
				esac
			done
		fi
	fi
	printf "Starting $DEFAULT nodes ...."
	while [ $cnt -ne $DEFAULT ]
	do
		if [ $cnt -eq $[$DEFAULT - 1] ]
		then
			mvn exec:exec > /dev/null
		else
			nohup mvn exec:exec > /dev/null 2> /dev/null &
		fi
		cnt=$[$cnt + 1]
	done
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
		exit 0
	else
		printf " ${RED}FAIL${NC}\n"
		exit 1
	fi
fi

printf "Invalid argument!\n" >&2
exit 1
