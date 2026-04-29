package com.pushi.gv.graph.factory.properties;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = PoolProperties.PROJECT_PREFIX)
public class PoolProperties {

    public static final String PROJECT_PREFIX = "project.object";

    /**
     * 空闲队列是否维持后进先出，默认为 true。
     * 如果为 false，就维持先进先出特性。
     */
    private boolean lifo = true;

    /**
     * 如果多个调用线程在等待获取对象，那么他们之间是否应该先到先得（公平），默认为 false，也就是不维持先到先得的特性。
     */
    private boolean fairness = false;

    /**
     * 对象池没有可用空闲对象的时候，调用方最长等待多长时间（毫秒）。默认值 -1，表示无限等待。
     * 如果配置为 1000，表示最长等待 1 秒。超过 1 秒，给调用方返回超时异常。
     */
    private long maxWaitMillis = 1000L * 60L * 30L;

    /**
     * 对象池的最大容量。池里最多存放多少个对象
     * 默认 8。
     */
    private int maxTotal = 8;

    /**
     * 对象池的最大容量。池里最多存放多少个对象，也就是连接池每个key最大实例化连接数
     * 默认 8 最大连接数，在给定时间池可以分配的最大对象数（检出给客户端，或空闲等待检出）。当为负数时，池一次可以管理的对象数量没有限制。
     */
    private int maxTotalPerKey = 8;

    /**
     * 对象池每个 key 最大空闲值，也就是对象池中最多可以有多少个空闲对象。
     * 当经过一个高峰时间后，连接池可以慢慢将已经用不到的连接慢慢释放一部分，一直减少到 minIdlePerKey 为止。
     * 当对象被归还的时候，如果池中空闲对象数量已经达到该值，那么被归还的对象直接被销毁，不需要再进入空闲对象列表。
     * 空闲链接数大于 maxIdle 时，将进行回收
     * 默认为 8，表示即使没有数据库连接时依然可以保持 8 个空闲的连接，而不被清除
     */
    private int maxIdlePerKey = 8;

    /**
     * 对象池每个 key 最小的闲置对象数，也就是对象池中最少需要有几个空闲对象。
     * 高负载的应用系统中，维持一定量的空闲对象可以减少对象频繁销毁、创建。减轻应用压力。
     * 默认值为 0，该值的有效范围n应该满足： 0 < n <= minIdlePerKey，低于 minIdlePerKey 时，将创建新的链接
     */
    private int minIdlePerKey = 0;

    /**
     * 回收器线程多久执行一次空闲对象回收（轮询间隔时间，单位毫秒）
     * 默认 -1，意味着不启动回收器线程。
     * 只有设置一个大于 0 的数值，才会启动回收器线程，同时 numTestsPerEvictionRun, softMinEvictableIdleTimeMillis，minEvictableIdleTimeMillis
     * 这三个参数才会生效。否则，即便下面三个参数都指定了有效值，那么也不会产生实际效果。
     * 如果配置为 60000，意味着1分钟执行一次空闲回收。
     */
    private long timeBetweenEvictionRunsMillis = 1000L * 60L * 1L;

    /**
     * 根据该值 x 可以推导出一个数值n，标识回收过程需要检查多少个空闲对象。
     * 如果 x>=0，那么 n=x。
     * 如果 x<0，那么 n=（空闲对象数量/x的绝对值）向上取整，假设空闲对象一共有 10 个，该值配置为 -3，那么就意味着这次回收需要检查 4 个空闲对象。
     * 默认值 3
     */
    private int numTestsPerEvictionRun = -1;

    /**
     * 软回收时间阈值
     * 一个对象如果空闲时间超过了该值（毫秒），并且空闲对象的数量已经大于了 minIdle 时，就可以被回收器回收。
     * 只有大于 0 的值，才被认为是一个有效值。默认值 -1 相当于 Long.MAX_VALUE。
     * 如果设置为 120000，意味着如果一个对象空闲时间超过了 2 分钟，并且空闲对象数量大于 minIdle，那么这个对象可以被回收。
     */
    private long softMinEvictableIdleTimeMillis = 1000L * 60L * 3L;

    /**
     * 硬回收时间阈值
     * 一个对象如果空闲时间超过了该值，不 care 空闲对象数量，即使空闲对象的数量已经小于 minIdle了，一样也会被回收器回收。
     * 默认值是 30 分钟。只有大于 0 的值，才被认为是一个有效值。小于 0 的值相当于 Long.MAX_VALUE。
     * 如果设置为 180000，意味着如果一个对象空闲时间超过了 3 分钟，就可以被回收。
     * 如果配置了 minEvictableIdleTimeMillis，那么 softMinEvictableIdleTimeMillis 一定要小于 minEvictableIdleTimeMillis 才有意义
     * 否则 softMinEvictableIdleTimeMillis 就相当于不生效。
     */
    private long minEvictableIdleTimeMillis = 1000L * 60L * 5L;

    /**
     * 当往对象池里新加入一个新对象的时候，是否校验该新对象的有效性。
     * 默认 false，也就是不校验。
     * 这个一般不建议设置为 true，新建的对象，在很短的时间内失效的可能性很小。
     */
    private boolean testOnCreate = false;

    /**
     * 当从对象池里借走一个对象的时候，是否校验该对象的有效性。
     * 默认 false，也就是不校验。
     * 如果负载不是很高的系统，回收器轮询间隔又比较长的，该值可以设置为 true，来保证获取到的连接一定是有效的。
     */
    private boolean testOnBorrow = true;

    /**
     * 当往对象池里归还一个对象的时候，是否校验该对象的有效性。
     * 默认值为 false。
     * 这个一般不建议设置为 true，归还的对象校验有效性的意义不是很大，还会降低性能。重点保证获取到的对象是有效的就行。参见：testOnBorrow
     */
    private boolean testOnReturn = false;

    /**
     * 当回收器在扫描空闲对象时，是否校验对象的有效性。
     * 如果某个对象空闲时间还没达到规定的阈值，如果 testWhileIdle 配置为 true，那么就会检查该对象是否还有效，如果该对象的资源已经失效（例如：连接断开），那么他就可以被回收。
     * 这个强烈建议设置为 true。（要与回收器轮询间隔时间、检测的对象数量配合好）。
     * 例如：在某个高负载的系统里，对象频繁被借出、被归还。
     * 1、testOnBorrow、testOnReturn 都设置为 false，提升性能；
     * 2、timeBetweenEvictionRunsMillis 设置为 60000，一分钟进行一次空闲对象的回收检查。
     * 3、numTestsPerEvictionRun 设置为 -1，检查所有空闲对象。
     * 4、minEvictableIdleTimeMillis 设置为 180000，空闲超过 3 分钟的可以被回收。
     * 5、testWhileIdle 设置为 true，不管空闲时间是否超时，每个空闲对象都检查下有效性，无效的一样被回收。
     * 通过异步的回收器来尽可能的保证空闲对象的有效性，减少同步调用时有效性检查导致的响应延迟、以及有效性检查对底层带来的访问压力。
     */
    private boolean testWhileIdle = true;

    /**
     * 活跃对象总数达到上限时是否阻塞
     * 当活跃对象总数达到上限，继续调用 borrowObject 是是否阻塞，默认 true 阻塞
     */
    private boolean blockWhenExhausted = true;

    /**
     * 是否启用 jmx
     */
    private boolean jmxEnabled = false;

    @Override
    public String toString() {
        return "PoolProperties{" +
                "lifo=" + lifo +
                ", fairness=" + fairness +
                ", maxWaitMillis=" + maxWaitMillis +
                ", maxTotal=" + maxTotal +
                ", maxTotalPerKey=" + maxTotalPerKey +
                ", maxIdlePerKey=" + maxIdlePerKey +
                ", minIdlePerKey=" + minIdlePerKey +
                ", timeBetweenEvictionRunsMillis=" + timeBetweenEvictionRunsMillis +
                ", numTestsPerEvictionRun=" + numTestsPerEvictionRun +
                ", softMinEvictableIdleTimeMillis=" + softMinEvictableIdleTimeMillis +
                ", minEvictableIdleTimeMillis=" + minEvictableIdleTimeMillis +
                ", testOnCreate=" + testOnCreate +
                ", testOnBorrow=" + testOnBorrow +
                ", testOnReturn=" + testOnReturn +
                ", testWhileIdle=" + testWhileIdle +
                ", blockWhenExhausted=" + blockWhenExhausted +
                ", jmxEnabled=" + jmxEnabled +
                '}';
    }
}

