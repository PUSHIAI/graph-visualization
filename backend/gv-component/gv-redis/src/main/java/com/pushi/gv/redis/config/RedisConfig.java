package com.pushi.gv.redis.config;

import java.time.Duration;

import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * redis 配置类
 *
 * @author anj
 */
@Configuration
@EnableCaching
@DependsOn(value = {"redisTemplateProperties"})
public class RedisConfig extends CachingConfigurerSupport {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Autowired
    private RedisTemplateProperties redisTemplateProperties;

    @Bean
    public RedisTemplate redisTemplate() {

        log.info("#### redis模式: " + this.redisTemplateProperties.getModel());
        log.info("#### redis stand_alone hosts: " + this.redisTemplateProperties.getHost());
        log.info("#### redis stand_alone port: " + this.redisTemplateProperties.getPort());
        log.info("#### redis cluster hosts: " + this.redisTemplateProperties.getCluster());

        /* ========= 连接池通用配置 ========= */
        GenericObjectPoolConfig genericObjectPoolConfig = new GenericObjectPoolConfig();
        genericObjectPoolConfig.setMaxTotal(this.redisTemplateProperties.getMaxActive());
        genericObjectPoolConfig.setMinIdle(this.redisTemplateProperties.getMinIdle());
        genericObjectPoolConfig.setMaxIdle(this.redisTemplateProperties.getMaxIdle());
        genericObjectPoolConfig.setMaxWaitMillis(this.redisTemplateProperties.getMaxWait());

        /* ========= lettuce pool ========= */
        LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder builder = LettucePoolingClientConfiguration.builder();
        builder.poolConfig(genericObjectPoolConfig);
        builder.commandTimeout(Duration.ofSeconds(this.redisTemplateProperties.getTimeout()));
        LettuceConnectionFactory connectionFactory;
        switch (this.redisTemplateProperties.getModel()) {
            case "stand_alone":
                connectionFactory = new LettuceConnectionFactory(redisStandaloneConfiguration(), builder.build());
                break;
            case "cluster":
                connectionFactory = new LettuceConnectionFactory(redisClusterConfiguration(), builder.build());
                break;
            default:
                throw new NullPointerException("###### redis配置连接模式错误");
        }

        connectionFactory.afterPropertiesSet();
        /* ========= 创建 template ========= */
        return createRedisTemplate(connectionFactory);
    }

    /**
     * 创建redis模版
     *
     * @param redisConnectionFactory Redis的连接线程安全的工厂
     * @return redis模版
     */
    private RedisTemplate createRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);

        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);

        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);

        redisTemplate.setValueSerializer(jackson2JsonRedisSerializer);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.afterPropertiesSet();
        return redisTemplate;
    }

    /**
     * 单机版模式
     *
     * @return RedisStandaloneConfiguration
     */
    private RedisStandaloneConfiguration redisStandaloneConfiguration() {
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration();
        configuration.setHostName(this.redisTemplateProperties.getHost());
        configuration.setPort(this.redisTemplateProperties.getPort());
        configuration.setPassword(RedisPassword.of(this.redisTemplateProperties.getPassword()));
        configuration.setDatabase(this.redisTemplateProperties.getDatabase());
        return configuration;
    }

    /**
     * 集群集群模式
     *
     * @return RedisClusterConfiguration
     */
    private RedisClusterConfiguration redisClusterConfiguration() {
        RedisClusterConfiguration config = new RedisClusterConfiguration(this.redisTemplateProperties.getCluster());
        if (this.redisTemplateProperties.getPassword() != null) {
            config.setPassword(RedisPassword.of(this.redisTemplateProperties.getPassword()));
        }
        return config;
    }
}