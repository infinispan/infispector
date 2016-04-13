package org.infispector.kafka.producers;

import kafka.javaapi.producer.Producer;
import kafka.producer.KeyedMessage;
import kafka.producer.ProducerConfig;

import java.util.Properties;

public class InfiSpectorKafkaProducer {

   Producer<Integer, String> producer;

   public InfiSpectorKafkaProducer() {
      final Properties properties = new Properties();
      properties.put("metadata.broker.list", "localhost:9092");
      properties.put("serializer.class", "kafka.serializer.StringEncoder");
      properties.put("request.required.acks", "1");
      producer = new Producer<>(new ProducerConfig(properties));
   }

   public void sendToKafka(String message, String topic) {
      KeyedMessage<Integer, String> data = new KeyedMessage<>(topic, message);
      producer.send(data);
   }

   public void close() {
      producer.close();
   }
}