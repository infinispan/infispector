package org.infispector.protocols;

import org.infinispan.configuration.global.GlobalConfiguration;
import org.infinispan.configuration.global.GlobalConfigurationBuilder;
import org.infinispan.manager.DefaultCacheManager;
import org.infinispan.marshall.core.GlobalMarshaller;
import org.infispector.kafka.producers.InfiSpectorKafkaProducer;
import org.jgroups.Event;
import org.jgroups.Message;
import org.jgroups.View;
import org.jgroups.annotations.MBean;
import org.jgroups.annotations.Property;
import org.jgroups.conf.ClassConfigurator;
import org.jgroups.stack.Protocol;

import java.io.IOException;


/**
 * InfiSpector protocol is able to capture JGroups events (messages),
 * translate the payload and other information into JSON
 * and send this information to Kafka topic.
 *
 * @author Tomas Sykora
 * @author Bela Ban
 */
@MBean(description = "InfiSpector protocol")
public class JGROUPS_TO_KAFKA extends Protocol {
   protected static final short ID = 2015;
   private InfiSpectorKafkaProducer infiSpectorKafkaProducer = new InfiSpectorKafkaProducer();
   private GlobalMarshaller gm;

   @Property(description = "Suppresses printing to stdout if false")
   protected boolean do_print = true;

   @Property(description = "Capture only messages (msg.getLength()) greater than bytes_threshold")
   protected int bytes_threshold = 0;

   @Property(description = "Topic name for Kafka producer")
   protected String kafka_topic = "InfiSpectorTopic";

   static {
      ClassConfigurator.addProtocol(ID, JGROUPS_TO_KAFKA.class);
   }

   public void init() throws Exception {
      super.init();

      GlobalConfiguration glob = new GlobalConfigurationBuilder()
            .globalJmxStatistics().allowDuplicateDomains(true).enable()
            .build();
      DefaultCacheManager cm = new DefaultCacheManager(glob);
      cm.getCache();
      // obtain global marshaller to understand JGroups message's payload
      gm = cm.getGlobalComponentRegistry().getComponent("org.infinispan.marshaller.global");
   }

   public void start() throws Exception {
      super.start();
   }

   public void stop() {
      super.stop();
   }

   public void destroy() {
      super.destroy();
      infiSpectorKafkaProducer.close();
      gm.stop();
   }

   public Object down(Event evt) {
      switch (evt.getType()) {
         case Event.MSG:
            Message msg = (Message) evt.getArg();
            int num_bytes = msg.getLength();
            if (num_bytes > bytes_threshold) {
               if (do_print) {
                  System.out.printf("-- sending %d bytes\n", num_bytes);
                  System.out.println("-- headers are " + msg.printHeaders());
                  System.out.println("-- Was not sent to Kafka. We send only received messages capturing.");
               }
               // Was not sent to Kafka. We send only received messages capturing now. ^^^
               // sendMsgToKafka(msg, "sending/down");
            }
            break;

         // TODO: decide JSON structure for other Event types than Event.MSG
         case Event.VIEW_CHANGE:
            View view = (View) evt.getArg();
            System.out.println("view = " + view);
            break;
      }
      return down_prot.down(evt);
   }

   public Object up(Event evt) {
      switch (evt.getType()) {
         case Event.MSG:
            Message msg = (Message) evt.getArg();
            int num_bytes = msg.getLength();
            if (num_bytes > bytes_threshold) {
               if (do_print) {
                  System.out.printf("-- received %d bytes\n", num_bytes);
                  System.out.println("-- headers are " + msg.printHeaders());
               }
               sendMsgToKafka(msg, "receiving/up");
            }
            break;
      }
      return up_prot.up(evt);
   }

   private void sendMsgToKafka(Message msg, String direction) {
      Object o;
      try {
         o = gm.objectFromByteBuffer(msg.getBuffer());
      } catch (IOException e) {
         throw new IllegalStateException(e);
      } catch (ClassNotFoundException e) {
         throw new IllegalStateException(e);
      }

      String json = "{\n"
            + "\"direction\": \"" + direction + "\",\n"
            + "\"src\": \"" + msg.src() + "\",\n"
            + "\"dest\": \"" + msg.dest() + "\",\n"
            + "\"length\": " + msg.getLength() + ",\n"
            + "\"timestamp\": " + System.currentTimeMillis() + ",\n"            
            + "\"message\": \"" + o + "\"\n"
            + "}";
      infiSpectorKafkaProducer.sendToKafka(json, kafka_topic);
   }
}
