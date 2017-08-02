#colors
RED='\033[0;31m'
NC='\033[0m'		#normal color
GREEN='\033[0;32m'
WHITE='\033[1;37m'

if [[ $EUID -eq 0 ]]
then
	printf "Please, run this script as a ${WHITE}superuser${NC}, not root.\n"
	exit 1
fi

druid_location=`find / -type d -name druid* 2> /dev/null`
kafka_location=`find / -type d -name kafka* 2> /dev/null`

#dependencies download
if [ -z "$druid_location" ]
then
	printf "Downloading druid 0.8.3 ...."
	wget "http://static.druid.io/artifacts/releases/druid-0.8.3-bin.tar.gz" > /dev/null
	wait
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
		mv druid-0.8.3-bin.tar.gz $HOME
		tar -xvzf $HOME/druid-0.8.3-bin.tar.gz > /dev/null
		/bin/rm -rf $HOME/druid-0.8.3-bin.tar.gz > /dev/null
	else
		printf " ${RED}FAIL${NC}\n"
	fi
fi

if [ -z "$kafka_location" ]
then
	printf -n "Downloading kafka 2.10-0.8.2.0 ...."
	wget "http://mirror.dkm.cz/apache/kafka/0.8.2.0/kafka_2.10-0.8.2.0.tgz" > /dev/null
	wait
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
		mv kafka_2.10-0.8.2.0.tgz $HOME
		tar -xvzf $HOME/kafka_2.10-0.8.2.0.tgz > /dev/null
		/bin/rm -rf $HOME/kafka_2.10-0.8.2.0.tgz > /dev/null
	else
		printf " ${RED}FAIL${NC}\n"
	fi
fi

#sets alias infispector to start script infispector.sh

infispector_location=`find / -type d -iname infispector 2> /dev/null | awk '{ print length, $0 }' | sort -n -s | head -n1 | cut -f 2 -d ' '`

if [ -z "$infispector_location" ]
then
	printf "${RED}Unable to find infispector directory. It cannot be renamed for this script to work${NC}\n"
	exit 1
fi

if ! grep "#infispector" < ~/.bashrc > /dev/null
then
	printf "\n\n#infispector\n" >> ~/.bashrc
fi

if ! grep "alias infispector='${infispector_location}/infispector.sh'" < ~/.bashrc > /dev/null
then
	printf "alias infispector='${infispector_location}/infispector.sh'\n" >> ~/.bashrc
fi

cd $infispector_location

#check if npm is installed
npm --version > /dev/null
#npm install
if [ $? -ne 0 ]
then
	printf "${RED}npm is required${NC}"
	printf "Please install npm and run this script again\n"
	exit 1
else
	echo -n "npm install ...."
	npm install > /dev/null
	wait
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
	else
		printf " ${RED}FAIL${NC}\n"
		exit 1
	fi
fi

#check if mvn is installed
mvn --version > /dev/null
if [ $? -ne 0 ]
then
	printf "${RED}mvn is required${NC}\n"
	printf "Please install mvn and run this script again\n"
	exit 1
else
	printf "mvn clean install ...."
	mvn clean install > /dev/null
	wait
	if [ $? -eq 0 ]
	then
		printf " ${GREEN}OK${NC}\n"
	else
		printf " ${RED}FAIL${NC}\n"
		exit 1
	fi
fi

#create new file with autocomplete - requires permission
if ! ls /etc/bash_completion.d/ | grep "infispectorAutocomplete" > /dev/null
then
	sudo cp infispectorAutocomplete /etc/bash_completion.d/ #zmenit na mv!
fi
if ! grep "source /etc/bash_completion.d/infispectorAutocomplete" < ~/.bashrc > /dev/null
then
	printf "source /etc/bash_completion.d/infispectorAutocomplete\n" >> ~/.bashrc
fi

printf "${WHITE}Infispector is ready to use!\n"
printf "if you need help type word infispector in you terminal${NC}\n"
exit 0
