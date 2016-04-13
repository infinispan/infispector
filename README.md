<img src="https://raw.githubusercontent.com/infinispan/infispector/master_angular2_backup/img/logo.jpg" width="276" height="109">

Infinispan messages history,<br/>
is never more a mystery.<br/>

Meet InfiSpector, say hello!<br/>
He monitors that data flow.<br/>
Send the entries, let it grow,<br/>
InfiSpector makes the show!

## What is InfiSpector:

Our intention is to graphically represent JGroups communication
happening between Infinispan nodes in a cluster to help users and developers
better understand what's happening inside during data replication/distribution.

## Project structure

### infinispan_example_app    

Infinispan example application that is ready to be run in multiple terminals,
creating Infinispan cluster.


### infispector_app

Our InfiSpector application for visualization data flows.


### kafka_druid_infrastructure

Helper files and configurations for setting up our Lambda Architecture: 
Zookeper, Apache Kafka and Druid.