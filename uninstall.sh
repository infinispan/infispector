#!/bin/bash

modifyBashrc() {
    sed -i "/#infispector/d" ~/.bashrc
    sed -i "/alias infispector=.*/d" ~/.bashrc
    sed -i "/.*infispectorAutocomplete/d" ~/.bashrc
    sed -i "/infispector_location=.*/d" ~/.bashrc
    sed -i "/export infispector_location/d" ~/.bashrc
}

removeDruid() {
    druid_location=`find /home -type d -name druid-0.8.3 2> /dev/null`
    if [[ -z "$druid_location" ]]
    then
        read -p "Do you wish to remove druid? [y/n] " yn
        case $yn in
            [Yy]* ) /bin/rm -rf ${druid_location}; break;;
            [Nn]* ) break;;
            * ) echo "Please answer y or n.";;
        esac
    fi
}

removeKafka() {
    kafka_location=`find /home -type d -name kafka_2.10-0.8.2.0 2> /dev/null`
    if [[ -z "kafka_location" ]]
    then
        read -p "Do you wish to remove kafka? [y/n] " yn
        case $yn in
            [Yy]* ) /bin/rm -rf ${kafka_location}; break;;
            [Nn]* ) break;;
            * ) echo "Please answer y or n.";;
        esac
    fi
}

removeAutocompletion() {
    if ls /etc/bash_completion.d/ | grep "infispectorAutocomplete" > /dev/null
    then
        echo "Removing autocompletion for infispector. Root permission required."
        sudo rm -rf /etc/bash_completion.d/infispectorAutocomplete
    fi
}

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

while true;
do
    read -p "Are you sure you want to uninstall InfiSpector? [y/n] " yn
    case $yn in
        [Yy]* ) echo "Uninstalling..."; break;;
        [Nn]* ) exit 0;;
        * ) echo "Please answer y or n.";;
    esac
done
modifyBashrc
removeDruid
removeKafka
removeAutocompletion
/bin/rm -rf ${SCRIPTPATH}
