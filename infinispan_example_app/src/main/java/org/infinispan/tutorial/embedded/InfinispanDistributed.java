package org.infinispan.tutorial.embedded;

import org.infinispan.Cache;
import org.infinispan.configuration.cache.CacheMode;
import org.infinispan.configuration.cache.Configuration;
import org.infinispan.configuration.cache.ConfigurationBuilder;
import org.infinispan.configuration.global.GlobalConfiguration;
import org.infinispan.configuration.global.GlobalConfigurationBuilder;
import org.infinispan.context.Flag;
import org.infinispan.manager.DefaultCacheManager;

import java.util.UUID;

public class InfinispanDistributed {

   public static void main(String[] args) throws Exception {
//      // Setup up a clustered cache manager
//      GlobalConfigurationBuilder global = GlobalConfigurationBuilder.defaultClusteredBuilder();
//      // Make the default cache a distributed synchronous one
//      ConfigurationBuilder builder = new ConfigurationBuilder();
//      builder.clustering().cacheMode(CacheMode.DIST_SYNC);
//      // Initialize the cache manager
//      DefaultCacheManager cacheManager = new DefaultCacheManager(global.build(), builder.build());
        
      GlobalConfiguration glob = new GlobalConfigurationBuilder().clusteredDefault() // Builds a default clustered
            // configuration
            .transport().addProperty("configurationFile", "jgroups-udp.xml") // provide a specific JGroups configuration
            .globalJmxStatistics().allowDuplicateDomains(true).enable() // This method enables the jmx statistics of
            // the global configuration and allows for duplicate JMX domains
            .build(); // Builds the GlobalConfiguration object
      Configuration loc = new ConfigurationBuilder().jmxStatistics().enable() // Enable JMX statistics
            .clustering().cacheMode(CacheMode.DIST_SYNC) // Set Cache mode to DISTRIBUTED with SYNCHRONOUS replication
            .hash().numOwners(2) // Keeps two copies of each key/value pair
            .expiration().lifespan(60000) // Set expiration - cache entries expire after some time (given by
            // the lifespan parameter) and are removed from the cache (cluster-wide).
            .build();
      DefaultCacheManager cacheManager = new DefaultCacheManager(glob, loc, true);

      // Obtain the default cache
      Cache<String, String> cache = cacheManager.getCache();
      
      int numberOfPuts = 10;
      if (System.getenv("numberOfPuts") != null) {
         System.out.println("numberOfPuts specified = " + System.getenv("numberOfPuts")); 
         numberOfPuts = Integer.parseInt(System.getenv("numberOfPuts"));
      }
      
      // Store the current node address in some random keys
      for(int i=0; i < numberOfPuts; i++) {
         cache.put(UUID.randomUUID().toString(), cacheManager.getNodeAddress());
      }
      // Display the current cache contents for the whole cluster
      cache.entrySet().forEach(entry -> System.out.printf("%s = %s\n", entry.getKey(), entry.getValue()));
      // Display the current cache contents for this node
      cache.getAdvancedCache().withFlags(Flag.SKIP_REMOTE_LOOKUP)
            .entrySet().forEach(entry -> System.out.printf("%s = %s\n", entry.getKey(), entry.getValue()));

      Thread.sleep(20000);

      // Stop the cache manager and release all resources
      cacheManager.stop();
   }

}