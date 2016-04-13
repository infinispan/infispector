This README will help you set up Zookeper, Apache Kafka and Druid.

## Start Zookeeper

`./zkServer.sh start` from your/path/to/zookeeper-3.4.6/bin/

## Start Apache Kafka

`./kafka-server-start.sh ../config/server.properties` from your/path/to/kafka_2.11-0.8.2.2/bin

## To start Druid relatime node

From Druid installation destination folder run:
 
`java -Xmx512m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -Ddruid.realtime.specFile=path/to/infispectorDruid.spec -classpath "config/_common:config/realtime:lib/*" io.druid.cli.Main server realtime`

NOTE: you can find our spec file here: infispector/kafka_druid_infrastructure/infispectorDruid.spec

## Useful commands

###Apache Kafka

* Read the Kafka topic from command line:

`./kafka-console-consumer.sh --zookeeper localhost:2181 --topic InfiSpectorTopic --from-beginning`


* For enlisting registered topics:

`./kafka-topics.sh --zookeeper localhost:2181 --list`


* For deleting the topic run (+ be patient:))

`./kafka-topics.sh --delete --zookeeper localhost:2181 --topic InfiSpectorTopic`

NOTE: add `delete.topic.enable=true` into Kafka server.properties file that is being used for starting Kafka 


* You can use command line producer like:

`./kafka-console-producer.sh --broker-list localhost:9092 --topic InfiSpectorTopic`

NOTE: enter JSON into command line, pres enter