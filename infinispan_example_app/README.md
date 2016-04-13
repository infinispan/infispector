## Building and running the example application

- Run `mvn clean package` to build the application
- Run `mvn exec:exec` to execute the application. In case you're running a clustered step, run this from
  multiple terminals, where each instance will represent a node


We used Infinispan distributed application from the tutorial for simplicity
and demonstrative purposes.

What we add is a new custom JGroups protocol: JGROUPS_TO_KAFKA that we
use to send captured data to Apache Kafka instance for further processing.
