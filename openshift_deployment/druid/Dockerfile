
FROM centos
MAINTAINER mciz

ENV DRUID_VERSION   0.8.3
RUN yum -y install java-1.8.0-openjdk-headless tar \
    && yum clean all

RUN mkdir -p /opt/druid/ \
	&& cd /opt/druid/ \
	&& curl -s http://static.druid.io/artifacts/releases/druid-$DRUID_VERSION-bin.tar.gz | tar -xz --strip-components=1 \
    && yum clean all

COPY infispectorDruid.spec /opt/druid/config/
COPY sampleMessages.json /opt/druid/

RUN chmod -R a=u /opt/druid/
WORKDIR /opt/druid/

# 2181 is zookeeper, 9092 is kafka, 3888 is druid, 8084 is realtime druid
EXPOSE 2181 3888 9092 8084
