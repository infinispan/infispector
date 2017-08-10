#!/bin/bash

#colors
RED='\033[0;31m'
NC='\033[0m'		#normal color
GREEN='\033[0;32m'
WHITE='\033[1;37m'

if [[ $EUID -eq 0 ]]
then
	printf "Please, run this script as a ${WHITE}superuser${NC}, not root.\n" >&2
	exit 1
fi

wget -q --spider http://google.com

if [ $? -ne 0 ]
then
	printf "Internet connection is necessary in order to run this script\n" >&2
	exit 1
fi

druid_location=`find / -type d -name druid-0.8.3 2> /dev/null`
kafka_location=`find / -type d -name kafka_2.10-0.8.2.0 2> /dev/null`

#dependencies download

if echo $druid_location | grep "Trash" > /dev/null
then
	rm -rf $druid_location
	druid_location=""
fi

if [ -z "$druid_location" ]
then
	printf "Downloading druid 0.8.3 ...."
	wget --quiet "http://static.druid.io/artifacts/releases/druid-0.8.3-bin.tar.gz" > /dev/null
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
		tar -xvzf /druid-0.8.3-bin.tar.gz -C $HOME > /dev/null
		/bin/rm -rf druid-0.8.3-bin.tar.gz > /dev/null
	else
		printf " ${RED}FAIL${NC}\n"
	fi
fi

if echo $kafka_location | grep "Trash" > /dev/null
then
	rm -rf $kafka_location
	kafka_location=""
fi

if [ -z "$kafka_location" ]
then
	printf "Downloading kafka 2.10-0.8.2.0 ...."
	wget --quiet "http://mirror.hosting90.cz/apache/kafka/0.8.2.0/kafka_2.10-0.8.2.0.tgz" > /dev/null
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
		tar -xvzf kafka_2.10-0.8.2.0.tgz -C $HOME > /dev/null
		/bin/rm -rf kafka_2.10-0.8.2.0.tgz > /dev/null
		chmod +x $HOME/kafka_2.10-0.8.2.0/bin/*.sh
	else
		printf " ${RED}FAIL${NC}\n"
	fi
fi

#sets alias infispector to start script infispector.sh

infispector_location=`find / -type d -iname infispector 2> /dev/null | awk '{ print length, $0 }' | sort -n -s | head -n1 | cut -f 2 -d ' '`

if [ -z "$infispector_location" ]
then
	printf "${RED}Unable to find infispector directory. It cannot be renamed for this script to work${NC}\n" >&2
	exit 1
fi

if ! grep "#infispector" < ~/.bashrc > /dev/null
then
	printf "Modifying .bashrc file ...."
	printf "\n\n#infispector\n" >> ~/.bashrc
fi

if ! grep "alias infispector='${infispector_location}/infispector.sh'" < ~/.bashrc > /dev/null
then
	printf "alias infispector='${infispector_location}/infispector.sh'\n" >> ~/.bashrc
fi

#create new file with autocomplete - requires permission

if ! grep "source /etc/bash_completion.d/infispectorAutocomplete" < ~/.bashrc > /dev/null
then
	printf "source /etc/bash_completion.d/infispectorAutocomplete\n" >> ~/.bashrc
	printf " ${GREEN}OK${NC}\n"
fi
if ! ls /etc/bash_completion.d/ | grep "infispectorAutocomplete" > /dev/null
then
	printf "Moving autocomplete file to /etc/bash_completion.d/ (requires permission) ...."
	sudo cp $infispector_location/infispectorAutocomplete /etc/bash_completion.d/ #zmenit na mv!
	if [ $? -eq 1 ]
	then
		printf " ${RED}FAIL${NC}\n"
	else
		printf " ${GREEN}OK${NC}\n"	
	fi
fi
cd $infispector_location

#check if npm is installed
npm --version > /dev/null
#npm install
npm config set loglevel warn
if [ $? -ne 0 ]
then
	printf "${RED}npm is required${NC}"
	printf "Please install npm and run this script again\n" >&2
	exit 1
else
	echo -n "npm install ...."
	npm -s install 2> $infispector_location/npm_err.log
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
	else
		printf " ${RED}FAIL${NC}\n"
		printf "Error log available in file $infispector_location/npm_err.log\n" >&2
		exit 1
	fi
fi

if [ ! -s $infispector_location/npm_err.log ]
then
	rm $infispector_location/npm_err.log
fi

#check if mvn is installed
mvn --version > /dev/null
if [ $? -ne 0 ]
then
	printf "${RED}mvn is required${NC}\n"
	printf "Please install mvn and run this script again\n" >&2
	exit 1
else
	printf "mvn install ...."
	cd $infispector_location/infinispan_example_app/
	mvn -q clean install > $infispector_location/mvn_err.log
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
	else
		printf " ${RED}FAIL${NC}\n"
		printf "Error log available in file $infispector_location/mvn_err.log\n" >&2
		exit 1
	fi
fi

if [ ! -s $infispector_location/mvn_err.log ]
then
	rm $infispector_location/mvn_err.log
fi

source ~/.bashrc

printf "${WHITE}Infispector is ready to use!\n"
printf "if you need help type word infispector in you terminal${NC}\n"
exit 0
