package com.pushi.gv.graph.factory.configuration;

import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

import javax.annotation.PreDestroy;

import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.factory.GraphKeyedPooledObjectFactory;
import com.pushi.gv.graph.factory.objectpool.GraphObjectPool;
import com.pushi.gv.graph.factory.properties.PoolProperties;

@EnableConfigurationProperties(PoolProperties.class)
@Configuration
@Slf4j
public class PoolAutoConfiguration {

    private final PoolProperties poolProperties;

    private GraphObjectPool graphObjectPool;

    @Autowired
    public PoolAutoConfiguration(PoolProperties poolProperties) {
        this.poolProperties = poolProperties;
    }

    @Bean
    @ConditionalOnClass({GraphKeyedPooledObjectFactory.class})
    protected GraphObjectPool faceSDKPool() {
        log.info(this.poolProperties.toString());
        GraphKeyedPooledObjectFactory graphKeyedPooledObjectFactory = new GraphKeyedPooledObjectFactory();
        GenericKeyedObjectPoolConfig<GraphAdapter> graphAdapterGenericKeyedObjectPoolConfig = new GenericKeyedObjectPoolConfig<>();
        graphAdapterGenericKeyedObjectPoolConfig.setLifo(this.poolProperties.isLifo());
        graphAdapterGenericKeyedObjectPoolConfig.setFairness(this.poolProperties.isFairness());
        graphAdapterGenericKeyedObjectPoolConfig.setMaxWaitMillis(this.poolProperties.getMaxWaitMillis());
        graphAdapterGenericKeyedObjectPoolConfig.setMaxTotal(this.poolProperties.getMaxTotal());
        graphAdapterGenericKeyedObjectPoolConfig.setMaxTotalPerKey(this.poolProperties.getMaxTotalPerKey());
        graphAdapterGenericKeyedObjectPoolConfig.setMaxTotalPerKey(this.poolProperties.getMaxTotalPerKey());
        graphAdapterGenericKeyedObjectPoolConfig.setMaxIdlePerKey(this.poolProperties.getMaxIdlePerKey());
        graphAdapterGenericKeyedObjectPoolConfig.setMinIdlePerKey(this.poolProperties.getMinIdlePerKey());
        graphAdapterGenericKeyedObjectPoolConfig.setTimeBetweenEvictionRuns(Duration.ofMillis(this.poolProperties.getTimeBetweenEvictionRunsMillis()));
        graphAdapterGenericKeyedObjectPoolConfig.setNumTestsPerEvictionRun(this.poolProperties.getNumTestsPerEvictionRun());
        graphAdapterGenericKeyedObjectPoolConfig.setSoftMinEvictableIdleTime(Duration.ofMillis(this.poolProperties.getSoftMinEvictableIdleTimeMillis()));
        graphAdapterGenericKeyedObjectPoolConfig.setMinEvictableIdleTime(Duration.ofMillis(this.poolProperties.getSoftMinEvictableIdleTimeMillis()));
        graphAdapterGenericKeyedObjectPoolConfig.setTestOnCreate(this.poolProperties.isTestOnCreate());
        graphAdapterGenericKeyedObjectPoolConfig.setTestOnBorrow(this.poolProperties.isTestOnBorrow());
        graphAdapterGenericKeyedObjectPoolConfig.setTestOnReturn(this.poolProperties.isTestOnReturn());
        graphAdapterGenericKeyedObjectPoolConfig.setTestWhileIdle(this.poolProperties.isTestWhileIdle());
        graphAdapterGenericKeyedObjectPoolConfig.setBlockWhenExhausted(this.poolProperties.isBlockWhenExhausted());
        graphAdapterGenericKeyedObjectPoolConfig.setJmxEnabled(this.poolProperties.isJmxEnabled());
        this.graphObjectPool = new GraphObjectPool(graphKeyedPooledObjectFactory, graphAdapterGenericKeyedObjectPoolConfig);
        return this.graphObjectPool;
    }

    @PreDestroy
    public void destroy() {
        if (this.graphObjectPool != null) {
            this.graphObjectPool.close();
        }
    }
}
