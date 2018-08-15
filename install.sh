#!/bin/bash

downloadMaven() {
	printf "Downloading maven...\n"
	wget -q --show-progress $URL_MAVEN
	tar zxvf apache-maven-3.5.2-bin.tar.gz -C $HOME > /dev/null
	/bin/rm apache-maven-3.5.2-bin.tar.gz > /dev/null
	M2_HOME=$HOME/apache-maven-3.5.2
	#now add maven to .bashrc
	if ! cat ~/.bashrc | grep "PATH" > /dev/null
	then
		echo "M2_HOME='$M2_HOME'" >> ~/.bashrc
		echo "export M2_HOME" >> ~/.bashrc
		echo 'PATH=$M2_HOME/bin:$PATH' >> ~/.bashrc
		echo "export PATH" >> ~/.bashrc	
	else
		sed "/PATH=.*/i\
		M2_HOME='$M2_HOME'\nexport M2_HOME\n\n" -i ~/.bashrc
		#now add maven home to path
		sed "/PATH=.*/s/$/:\$M2_HOME\/bin/" -i ~/.bashrc
	fi
	printf "Maven successfully downloaded and installed!\n"
	source ~/.bashrc
}

#colors
RED='\033[0;31m'
NC='\033[0m'		#normal color
GREEN='\033[0;32m'
WHITE='\033[1;37m'

#urls
URL_DRUID="http://static.druid.io/artifacts/releases/druid-0.8.3-bin.tar.gz"
URL_KAFKA="https://archive.apache.org/dist/kafka/0.8.2.0/kafka_2.10-0.8.2.0.tgz"
URL_MAVEN="http://mirror.hosting90.cz/apache/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz"

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

printf "Looking for a druid-0.8.3 folder in device ...."
druid_location=`find /home -type d -name druid-0.8.3 2> /dev/null`
if echo $druid_location | grep "Trash" > /dev/null
then
	rm -rf $druid_location
	druid_location=""
fi

if [ -z "$druid_location" ]
then
	printf " ${RED}NOT FOUND${NC}.\n"
	wget -q --show-progress $URL_DRUID
	if [ $? -eq 0 ]
	then
		tar -xvzf druid-0.8.3-bin.tar.gz -C $HOME > /dev/null
		/bin/rm -rf druid-0.8.3-bin.tar.gz > /dev/null
	else
		printf "Druid download failed\n" >&2
		exit 1
	fi
else
	printf " ${GREEN}FOUND${NC}.\nDownload will be skipped.\n"
fi

printf "Looking for a kafka_2.10-0.8.2.0 folder in device ...."
kafka_location=`find /home -type d -name kafka_2.10-0.8.2.0 2> /dev/null`

if echo $kafka_location | grep "Trash" > /dev/null
then
	rm -rf $kafka_location
	kafka_location=""
fi

if [ -z "$kafka_location" ]
then
	printf " ${RED}NOT FOUND${NC}.\n"
	wget -q --show-progress $URL_KAFKA
	if [ $? -eq 0 ]
	then
		tar -xvzf kafka_2.10-0.8.2.0.tgz -C $HOME > /dev/null
		/bin/rm -rf kafka_2.10-0.8.2.0.tgz > /dev/null
		chmod +x $HOME/kafka_2.10-0.8.2.0/bin/*.sh
	else
		printf "Kafka download failed\n" >&2
	fi
else
	printf " ${GREEN}FOUND${NC}.\nDownload will be skipped.\n"
fi

#sets alias infispector to start script infispector.sh

infispector_location="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

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
	printf "infispector_location='${infispector_location}'\n" >> ~/.bashrc
	printf "export infispector_location\n" >> ~/.bashrc
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
	sudo cp $infispector_location/infispectorAutocomplete /etc/bash_completion.d/
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
	npm -s install 2> $infispector_location/npm_err.log > /dev/null
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
java -version > /dev/null
if [ $? -ne 0 ]
then
	printf "Please install java and run this script again\n" >&2
	exit 1
fi

mvn --version > /dev/null 2> /dev/null
if [ $? -ne 0 ]
then
	printf "Maven is necessary to run infispector.\n"
	while true;
	do
		read -p "Do you wish to install maven? [y/n] " yn
		case $yn in
			[Yy]* ) downloadMaven; break;;
			[Nn]* ) printf "Run ${GREEN}mvn clean install${NC} in ${WHITE}$infispector_location/infinispan_example_app/${NC} folder when you install maven."; exit 0;;
			* ) echo "Please answer y or n.";;
		esac
	done
fi
printf "mvn install ...."
cd $infispector_location/infinispan_example_app/
mvn clean install 2> $infispector_location/mvn_err.log
if [ $? -eq 0 ]
then
	printf " ${GREEN}OK${NC}\n"
else
	printf " ${RED}FAIL${NC}\n"
	printf "Error log available in file $infispector_location/mvn_err.log\n" >&2
	exit 1
fi

if [ ! -s $infispector_location/mvn_err.log ]
then
	rm $infispector_location/mvn_err.log
fi

source ~/.bashrc

printf "${WHITE}Infispector will be ready for use after terminal restart!\n"
printf "if you need help type word infispector in you terminal${NC}\n"
exit 0
