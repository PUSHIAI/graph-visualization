package com.pushi.gv.entity.idgenerator;

/**
 * 全局唯一ID生成器，使用Twitter的Snowflakeld算法实现
 *
 * @author anj
 */
public class IDGenerator {

    private static boolean inited = false;
    private static SnowflakeIdWorker idWorder = null;

    /**
     *
     */
    public IDGenerator() {
    }

    /**
     * 初始化ID生成器
     *
     * @param workerId     工作ID (0~31)
     * @param datacenterId 数据中心ID (0~31)
     * @return
     */
    public static void init(long workerId, long datacenterId) {
        if (inited) {
            return;
        }
        idWorder = new SnowflakeIdWorker(workerId, datacenterId);
        inited = true;
    }

    /**
     * @return
     */
    public static long nextId() {
        return idWorder.nextId();
    }
}
