
FROM centos
MAINTAINER mciz

ENV DRUID_VERSION   0.8.3
RUN mkdir -p /opt/kafka/ \
    && cd /opt/kafka/ \
    && yum -y install java-1.8.0-openjdk-headless tar \
    && curl -s https://www.mirrorservice.org/sites/ftp.apache.org/kafka/0.10.1.1/kafka_2.11-0.10.1.1.tgz | tar -xz --strip-components=1 \
    && yum clean all

RUN chmod -R a=u /opt/kafka

WORKDIR /opt/

# 2181 is zookeeper, 9092 is kafka, 3888 is druid, 8084 is realtime druid
EXPOSE 2181 2888 3888 9092
