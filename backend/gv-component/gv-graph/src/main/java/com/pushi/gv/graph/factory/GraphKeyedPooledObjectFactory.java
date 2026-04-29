package com.pushi.gv.graph.factory;

import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Constructor;
import java.util.Locale;

import org.apache.commons.pool2.BaseKeyedPooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;

import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.enums.GraphTypeEnum;

@Slf4j
public class GraphKeyedPooledObjectFactory extends BaseKeyedPooledObjectFactory<GraphConnectInfo, GraphAdapter> {

    /**
     * 包
     */
    private static final String ADAPTER_CLASS_PACKAGE = "com.pushi.gv.graph.adapter.impl.";

    /**
     * 连接类名
     */
    private static final String ADAPTER_CLASS_CONTEXT_NAME = "GraphAdapter";

    @Override
    public GraphAdapter create(GraphConnectInfo graphConnectInfo) throws Exception {
        log.info("################# create");
        if (graphConnectInfo == null || graphConnectInfo.getGraphType() == null) {
            throw new IllegalAccessException("图谱类型不能为空");
        }
        GraphTypeEnum graphTypeEnum = graphConnectInfo.getGraphType();
        GraphAdapter graphAdapter;
        try {
            char[] graphTypeEnumNameChar = graphTypeEnum.name().toLowerCase(Locale.ROOT).toCharArray();
            graphTypeEnumNameChar[0] -= 32;
            String fullClassName = ADAPTER_CLASS_PACKAGE + String.valueOf(graphTypeEnumNameChar) + ADAPTER_CLASS_CONTEXT_NAME;
            Class<?> cls = Class.forName(fullClassName);
            Class<?>[] paramTypes = {GraphConnectInfo.class};
            Object[] params = {graphConnectInfo};
            Constructor<?> con = cls.getConstructor(paramTypes);
            graphAdapter = (GraphAdapter) con.newInstance(params);
        } catch (Exception e) {
            log.error("没有图谱适配器", e);
            throw new IllegalAccessException("没有图谱适配器");
        }
        return graphAdapter;
    }

    @Override
    public PooledObject<GraphAdapter> wrap(GraphAdapter graphAdapter) {
        log.info("################# wrap");
        return new DefaultPooledObject<>(graphAdapter);
    }

    @Override
    public PooledObject<GraphAdapter> makeObject(GraphConnectInfo graphConnectInfo) throws Exception {
        log.info("################# makeObject");
        return super.makeObject(graphConnectInfo);
    }

    @Override
    public void activateObject(GraphConnectInfo graphConnectInfo, PooledObject<GraphAdapter> pooledObject) throws Exception {
        boolean isOpen = pooledObject.getObject().isOpen();
        log.info("################# activateObject: {}", isOpen);
        if (!isOpen) {
            pooledObject.getObject().reOpenGraph();
        }
        super.activateObject(graphConnectInfo, pooledObject);
    }

    @Override
    public void destroyObject(GraphConnectInfo graphConnectInfo, PooledObject<GraphAdapter> pooledObject) throws Exception {
        log.info("################# destroyObject");
        pooledObject.getObject().close();
        pooledObject = null;
        super.destroyObject(graphConnectInfo, pooledObject);
    }

    @Override
    public void passivateObject(GraphConnectInfo graphConnectInfo, PooledObject<GraphAdapter> pooledObject) throws Exception {
        boolean isOpen = pooledObject.getObject().isOpen();
        log.info("################# passivateObject: {}", isOpen);
        if (!isOpen) {
            log.error("################# passivateObject 连接丢失");
            throw new RuntimeException("连接丢失");
        }
        super.passivateObject(graphConnectInfo, pooledObject);
    }

    @Override
    public boolean validateObject(GraphConnectInfo graphConnectInfo, PooledObject<GraphAdapter> pooledObject) {
        boolean isOpen = pooledObject.getObject().isOpen();
        log.info("################# validateObject: {}", isOpen);
        return isOpen;
    }
}
