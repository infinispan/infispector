#!/bin/bash

cleanUp() {
	pkill -f app.js
	pkill -f grunt
	rm tmp
	rm tmp2
}

grunt > tmp 2> tmp2 &

while true
do
	if cat tmp | grep "Server is listening on port [0-9][0-9]*" > /dev/null
	then
		cleanUp
		exit 0
	fi
	if [ -s tmp2 ]
	then
		cat tmp2
		cleanUp
		exit 1
	fi
	sleep 1
done
