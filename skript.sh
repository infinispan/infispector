#!/bin/bash

if [ "$#" -ne 2 ]; then
	echo "Skript takes 2 arguments. 1st is path to kafka, 2nd is path to druid."
fi

PATH_TO_KAFKA=`realpath $1`
PATH_TO_DRUID=`realpath $2`
PATH_TO_IS=`realpath .`

cd $PATH_TO_KAFKA 2>/dev/null

if [ "$?" -eq 1 ]; then
	echo "Invalid path" >&2
	exit 1
fi

bin/zookeeper-server-start.sh config/zookeeper.properties &

sleep 1

if [ "$?" -eq 1 ]; then
	echo "Unable to start zookeeper. Please check if installed and you put right path to kafka" >&2
	exit 1
fi

bin/kafka-server-start.sh config/server.properties &

sleep 2

if [ "$?" -eq 1 ]; then
	echo "Unable to start kafka. Please check if installed and you put right path to kafka" >&2
	kill $ZOOKEEPER_PID
	exit 1
fi

cd $PATH_TO_DRUID

if [ "$?" -eq 1 ]; then
	echo "Invalid path" >&2
fi

java -Xmx512m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -Ddruid.realtime.specFile=$PATH_TO_IS/kafka_druid_infrastructure/infispectorDruid.spec -classpath "config/_common:config/realtime:lib/*" io.druid.cli.Main server realtime

exit 0