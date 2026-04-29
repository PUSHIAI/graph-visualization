package com.pushi.gv.graph.adapter.impl;

import java.util.List;

import org.apache.tinkerpop.gremlin.process.traversal.dsl.graph.GraphTraversalSource;
import org.janusgraph.core.JanusGraph;

import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.graph.EdgeModel;
import com.pushi.gv.graph.entity.graph.ExistModel;
import com.pushi.gv.graph.entity.graph.GraphModel;
import com.pushi.gv.graph.entity.graph.SchemaModel;
import com.pushi.gv.graph.entity.graph.VertexModel;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;
import com.pushi.gv.graph.entity.graph.modify.ModifyAttribute;
import com.pushi.gv.graph.entity.graph.modify.ModifyType;
import com.pushi.gv.graph.entity.graph.query.GraphQuery;

public class JanusGraphAdapter extends GraphAdapter {

    private JanusGraph janusGraph;

    private GraphTraversalSource g = null;

    private final String DEFAULT_UNIQUELY_ID_KEY = "_id";

    private String DEFAULT_NAME_KEY = "name";

    private String DEFAULT_TYPE = "type";

    public JanusGraphAdapter(GraphConnectInfo graphConnectInfo) throws IllegalAccessException {
        super(graphConnectInfo);
        if (graphConnectInfo == null || graphConnectInfo.getJanusConnect() == null
                || graphConnectInfo.getJanusConnect().getJanusConnectProperties() == null
                || graphConnectInfo.getJanusConnect().getJanusConnectProperties().size() == 0) {
            throw new IllegalAccessException("连接信息错误");
        }
    }

    @Override
    public void openGraph() {

    }

    @Override
    public void reOpenGraph() {

    }

    @Override
    public Boolean isOpen() {
        return null;
    }

    @Override
    public void close() {

    }

    @Override
    public SchemaModel getSchema() {
        return null;
    }

    @Override
    public List<String> getAllAttributes() {
        return null;
    }

    @Override
    public List<VertexModel> getVertexs(GraphQuery graphQuery) {
        return null;
    }

    @Override
    public Long count(GraphQuery graphQuery) {
        return null;
    }

    @Override
    public GraphModel expand(GraphQuery graphQuery) {
        return null;
    }

    @Override
    public ExistModel queryExist(GraphQuery graphQuery) {
        return null;
    }

    @Override
    public GraphModel shortPath(GraphQuery graphQuery) {
        return null;
    }

    @Override
    public void batchAddVertexs(List<AddVertexModel> addVertexModelList) {

    }

    @Override
    public VertexModel addVertex(AddVertexModel addVertexModel) {
        return null;
    }

    @Override
    public void batchAddEdges(List<AddEdgeModel> addEdgeModelList) {

    }

    @Override
    public List<EdgeModel> addEdges(AddEdgeModel addEdgeModel) {
        return null;
    }

    @Override
    public void updateType(ModifyType modifyType) {

    }

    @Override
    public void updateAttribute(ModifyAttribute modifyAttribute) {

    }

    @Override
    public void delete(Object id, Boolean vertex) {

    }

    @Override
    public void deleteVertexType(Object id, List<String> typeList) {

    }

    @Override
    public void deleteAttribute(Object id, List<String> attributeList, Boolean vertex) {

    }
}
