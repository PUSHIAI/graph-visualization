package com.pushi.gv.graph.factory.objectpool;

import org.apache.commons.pool2.KeyedPooledObjectFactory;
import org.apache.commons.pool2.impl.AbandonedConfig;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;

import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;

public class GraphObjectPool extends GenericKeyedObjectPool<GraphConnectInfo, GraphAdapter> {

    public GraphObjectPool(KeyedPooledObjectFactory<GraphConnectInfo, GraphAdapter> factory) {
        super(factory);
    }

    public GraphObjectPool(KeyedPooledObjectFactory<GraphConnectInfo, GraphAdapter> factory, GenericKeyedObjectPoolConfig<GraphAdapter> config) {
        super(factory, config);
    }

    public GraphObjectPool(KeyedPooledObjectFactory<GraphConnectInfo, GraphAdapter> factory, GenericKeyedObjectPoolConfig<GraphAdapter> config, AbandonedConfig abandonedConfig) {
        super(factory, config, abandonedConfig);
    }
}
