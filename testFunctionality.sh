#!/bin/bash

cleanUp() {
	pkill -f app.js
	pkill -f grunt
	cat tmp
	cat tmp2
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
		cleanUp
		exit 1
	fi
	sleep 1
done
