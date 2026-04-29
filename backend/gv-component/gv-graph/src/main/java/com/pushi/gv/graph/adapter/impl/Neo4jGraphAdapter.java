package com.pushi.gv.graph.adapter.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang.time.StopWatch;
import org.apache.commons.lang3.StringUtils;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.Value;
import org.neo4j.driver.internal.value.ListValue;
import org.neo4j.driver.types.Node;
import org.neo4j.driver.types.Path;
import org.neo4j.driver.types.Relationship;

import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.graph.AttributeModel;
import com.pushi.gv.graph.entity.graph.EdgeModel;
import com.pushi.gv.graph.entity.graph.ExistModel;
import com.pushi.gv.graph.entity.graph.GraphModel;
import com.pushi.gv.graph.entity.graph.SchemaModel;
import com.pushi.gv.graph.entity.graph.VertexModel;
import com.pushi.gv.graph.entity.graph.add.AddAttributeModel;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;
import com.pushi.gv.graph.entity.graph.modify.ModifyAttribute;
import com.pushi.gv.graph.entity.graph.modify.ModifyType;
import com.pushi.gv.graph.entity.graph.query.GraphQuery;
import com.pushi.gv.graph.exceptions.GraphConnectException;

@Slf4j
public class Neo4jGraphAdapter extends GraphAdapter {

    private Driver driver;

    private Session session;

    public Neo4jGraphAdapter(GraphConnectInfo graphConnectInfo) {
        super(graphConnectInfo);
        if (graphConnectInfo == null || graphConnectInfo.getNeo4jConnect() == null || graphConnectInfo.getNeo4jConnect().getBolt() == null) {
            throw new IllegalArgumentException("连接信息错误");
        }
    }

    @Override
    public void openGraph() {
        if (this.driver != null || this.isOpen()) {
            return;
        }

        if (StringUtils.isNotBlank(this.graphConnectInfo.getNeo4jConnect().getUserName())
                && StringUtils.isNotBlank(this.graphConnectInfo.getNeo4jConnect().getPassword())) {
            try {
                this.driver = GraphDatabase.driver(this.graphConnectInfo.getNeo4jConnect().getBolt(),
                        AuthTokens.basic(this.graphConnectInfo.getNeo4jConnect().getUserName(), this.graphConnectInfo.getNeo4jConnect().getPassword()));
                this.session = this.driver.session();
            } catch (Exception e) {
                throw new GraphConnectException("neo4j bolt 连接失败", e);
            }
        } else {
            try {
                this.driver = GraphDatabase.driver(this.graphConnectInfo.getNeo4jConnect().getBolt());
                this.session = this.driver.session();
            } catch (Exception e) {
                throw new GraphConnectException("neo4j bolt 连接失败", e);
            }
        }
    }

    @Override
    public void reOpenGraph() {
        this.close();
        this.openGraph();
    }

    @Override
    public Boolean isOpen() {
        if (this.session == null) {
            return false;
        }
        return this.session.isOpen();
    }

    @Override
    public void close() {
        if (this.session != null) {
            this.session.close();
        }
        if (this.driver != null) {
            this.driver.close();
        }
    }

    @Override
    public SchemaModel getSchema() {
        return this.session.readTransaction(tx -> {
            Result result = tx.run("call db.schema.visualization");
            List<Record> schemaRecordList = result.list();

            SchemaModel schemaModel = new SchemaModel();
            Set<String> vertexSet = new HashSet<>();
            Set<String> relationshipsSet = new HashSet<>();

            schemaRecordList.get(0).get("nodes").values().forEach(value -> vertexSet.addAll((Collection<? extends String>) value.asNode().labels()));
            schemaRecordList.get(0).get("relationships").values().forEach(value -> relationshipsSet.add(value.asRelationship().type()));
            schemaModel.setVertexList(new ArrayList<>(vertexSet));
            schemaModel.setEdgeList(new ArrayList<>(relationshipsSet));
            return schemaModel;
        });
    }

    @Override
    public List<String> getAllAttributes() {
        return this.session.readTransaction(tx -> {
            Result result = tx.run("CALL db.propertyKeys() YIELD propertyKey");
            List<Record> recordList = result.list();

            Set<String> propertiesSet = new HashSet<>();
            for (Record propertiesRecord : recordList) {
                if (propertiesRecord.values() == null || propertiesRecord.values().size() == 0) {
                    continue;
                }
                for (String key : propertiesRecord.keys()) {
                    Value value = propertiesRecord.get(key);
                    if (value instanceof ListValue) {
                        ListValue listValue = (ListValue) value;
                        listValue.asList(v -> propertiesSet.add(StrUtil.strip(Objects.toString(v), "\"")));
                    } else {
                        propertiesSet.add(StrUtil.strip(Objects.toString(value), "\""));
                    }
                }
            }
            propertiesSet.add("id");
            return new ArrayList<>(propertiesSet);
        });
    }

    @Override
    public List<VertexModel> getVertexs(GraphQuery graphQuery) {
        StringBuilder sqlStringBuilder = this.getQueryVertexSql(graphQuery);
        sqlStringBuilder.append(" RETURN n");

        if (graphQuery.getCurrentPage() != null && graphQuery.getPageSize() != null) {
            long currentPage = graphQuery.getCurrentPage() == null || graphQuery.getCurrentPage() < 0L ? 0L : graphQuery.getCurrentPage();
            long pageSize = graphQuery.getPageSize() == null || graphQuery.getPageSize() < 0L ? 10L : graphQuery.getPageSize();
            sqlStringBuilder.append(" SKIP ").append(currentPage * pageSize).append(" LIMIT ").append(pageSize);
        }

        log.info("neo4j query: {}", sqlStringBuilder);

        return this.session.readTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());
            List<Record> recordList = result.list();
            List<VertexModel> vertexModelList = new ArrayList<>();
            for (Record vertexRecord : recordList) {
                if (vertexRecord.values() == null || vertexRecord.values().size() == 0) {
                    continue;
                }
                vertexRecord.values().forEach(vertex -> vertexModelList.add(transNode(vertex.asNode())));
            }
            return vertexModelList;
        });
    }

    @Override
    public Long count(GraphQuery graphQuery) {
        StringBuilder sqlStringBuilder = this.getQueryVertexSql(graphQuery);
        sqlStringBuilder.append(" RETURN count(n)");

        log.info("neo4j count query: {}", sqlStringBuilder);
        return this.session.readTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());
            List<Record> recordList = result.list();
            return recordList.get(0).get("count(n)").asLong(0L);
        });
    }

    @Override
    public GraphModel expand(GraphQuery graphQuery) {
        StringBuilder sqlStringBuilder = this.getQueryExpandSql(graphQuery);
        sqlStringBuilder.append(" RETURN p");

        log.info("neo4j expand query: {}", sqlStringBuilder);
        return this.session.readTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());

            GraphModel graphModel = new GraphModel();
            result.stream().parallel().forEach(record -> {
                Path path = record.get("p").asPath();
                path.nodes().forEach(node -> graphModel.getVertexList().add(this.transNode(node)));
                path.relationships().forEach(relationship -> graphModel.getEdgeList().add(this.transEdge(relationship)));
            });
            return graphModel;
        });
    }

    @Override
    public ExistModel queryExist(GraphQuery graphQuery) {
        if (graphQuery == null || graphQuery.getIdList() == null || graphQuery.getIdList().isEmpty()) {
            throw new IllegalArgumentException("连接信息错误");
        }

        String sqlStringBuilder = "MATCH (n) where id(n) in " + graphQuery.getIdList() + " RETURN id(n) as id";

        return this.session.readTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder);
            ExistModel existModel = new ExistModel();
            existModel.setExistList(new ArrayList<>());
            existModel.setExistList(result.stream().parallel().map(record -> record.get("id").asObject().toString()).collect(Collectors.toList()));
            if (existModel.getExistList() != null && !existModel.getExistList().isEmpty()) {
                existModel.setNotExistList(new ArrayList<>(CollUtil.disjunction(graphQuery.getIdList(), existModel.getExistList())));
            } else {
                existModel.setNotExistList(graphQuery.getIdList());
            }
            return existModel;
        });
    }

    @Override
    public GraphModel shortPath(GraphQuery graphQuery) {
        if (graphQuery == null || graphQuery.getIdList() == null || graphQuery.getIdList().isEmpty()) {
            throw new IllegalArgumentException("连接信息错误");
        }
        StringBuilder sqlStringBuilder = new StringBuilder("with ")
                .append(graphQuery.getIdList())
                .append("  as id_list" +
                        " match (v) where id(v) in id_list" +
                        " with collect(v) as nodes" +
                        " unwind nodes as source" +
                        " unwind nodes as target" +
                        " with source,target where id(source) < id(target)")
                .append(" match p = allShortestPaths((source)-[");
        if (graphQuery.getDeep() != null && graphQuery.getDeep() >= 1) {
            sqlStringBuilder.append("*..").append(graphQuery.getDeep()).append("]");
        } else {
            sqlStringBuilder.append("]");
        }
        sqlStringBuilder.append("-(target)) return p");

        log.info("neo4j shortPath query: {}", sqlStringBuilder);

        return this.session.readTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());
            GraphModel graphModel = new GraphModel();
            result.stream().parallel().forEach(record -> {
                Path path = record.get("p").asPath();
                path.nodes().forEach(node -> graphModel.getVertexList().add(this.transNode(node)));
                path.relationships().forEach(relationship -> graphModel.getEdgeList().add(this.transEdge(relationship)));
            });
            return graphModel;
        });
    }

    @Override
    public void batchAddVertexs(List<AddVertexModel> addVertexModelList) {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        if (addVertexModelList == null) {
            return;
        }

        AddVertexModel addVertexModel = addVertexModelList.stream().filter(avm -> avm.getLabels() == null).findFirst().orElse(null);
        if (addVertexModel != null) {
            throw new IllegalArgumentException("点的类型不能为空");
        }

        int totalPage = (int) Math.ceil((double) addVertexModelList.size() / (double) 1000);

        for (int i = 0; i < totalPage; i++) {
            StringBuilder sqlStringBuilder = new StringBuilder("CREATE ");
            CollUtil.page(i, 1000, addVertexModelList).forEach(avm -> {
                sqlStringBuilder.append("(");
                avm.getLabels().forEach(label -> sqlStringBuilder.append(":").append(label));
                sqlStringBuilder.append(this.getAddPropertiesSql(avm.getAttributeList()));
                sqlStringBuilder.append("), ");
            });
            String sql = StrUtil.removeSuffix(sqlStringBuilder.toString(), ", ");
            log.info("neo4j addVertex query: {}", sql);
            this.session.writeTransaction(tx -> tx.run(sql));
        }

        log.info("插入实体总共时间：{} ms", stopWatch.getTime());
    }

    public VertexModel addVertex(AddVertexModel addVertexModel) {
        if (addVertexModel == null || addVertexModel.getLabels() == null || addVertexModel.getLabels().isEmpty()) {
            return new VertexModel();
        }

        StringBuilder sqlStringBuilder = new StringBuilder("CREATE ");
        sqlStringBuilder.append("(n");
        addVertexModel.getLabels().forEach(label -> sqlStringBuilder.append(":").append(label));
        sqlStringBuilder.append(this.getAddPropertiesSql(addVertexModel.getAttributeList()));
        sqlStringBuilder.append(")").append(" RETURN n");

        log.info("neo4j addVertex query: {}", sqlStringBuilder);

        VertexModel vertexModel = this.session.writeTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());
            List<Record> recordList = result.list();
            VertexModel vm = new VertexModel();
            for (Record vertexRecord : recordList) {
                if (vertexRecord.values() == null || vertexRecord.values().size() == 0) {
                    continue;
                }
                vm = transNode(vertexRecord.get("n").asNode());
            }
            return vm;
        });
        return vertexModel;
    }

    @Override
    public void batchAddEdges(List<AddEdgeModel> addEdgeModelList) {
        if (addEdgeModelList == null || addEdgeModelList.isEmpty()) {
            return;
        }

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        List<List<AddEdgeModel>> addEdgeModeGrouplList = CollUtil.groupByField(addEdgeModelList, "type");

        addEdgeModeGrouplList.forEach(aeml -> {
            int totalPage = (int) Math.ceil((double) aeml.size() / (double) 1000);
            for (int i = 0; i < totalPage; i++) {
                StringBuilder batchStringBuilder = new StringBuilder("[");
                StringBuilder attributeStringBuilder = new StringBuilder();
                CollUtil.page(i, 1000, aeml).forEach(addEdgeModel -> {
                    batchStringBuilder.append("{from: ").append("\"").append(addEdgeModel.getStartVertexId()).append("\"").append(", ")
                            .append("to: ").append("\"").append(addEdgeModel.getEndVertexId()).append("\"").append(", ")
                            .append("type: ").append("\"").append(addEdgeModel.getType()).append("\"").append(", ");
                    if (addEdgeModel.getAttributeList() != null && !addEdgeModel.getAttributeList().isEmpty()) {
                        batchStringBuilder.append("properties: {");
                        addEdgeModel.getAttributeList().forEach(addAttributeModel -> {
                            batchStringBuilder.append(addAttributeModel.getName()).append(": ")
                                    .append("\"").append(addAttributeModel.getValue()).append("\"").append(", ");
                            if (!StringUtils.contains(attributeStringBuilder, "row.properties." + addAttributeModel.getName())) {
                                attributeStringBuilder.append("rel.").append(addAttributeModel.getName()).append(" = ")
                                        .append("row.properties.").append(addAttributeModel.getName()).append(", ");
                            }
                        });
                        batchStringBuilder.append("} ,");
                    }
                    batchStringBuilder.append("}, ");
                });
                batchStringBuilder.append("]");
                String batchString = batchStringBuilder.toString().replace(", }", "}")
                        .replace(" ,}", "}").replace(", ]", "]");

                StringBuilder addEdgesStringBuilder = new StringBuilder("UNWIND ");
                addEdgesStringBuilder.append(batchString)
                        .append(" as row MATCH (from), (to) WHERE from.index = row.from and to.index = row.to  ")
                        .append("CREATE (from)-[rel:").append(aeml.get(0).getType()).append("]->(to) ");
                if (StringUtils.isNotBlank(attributeStringBuilder)) {
                    addEdgesStringBuilder.append("SET ").append(StrUtil.removeSuffix(attributeStringBuilder.toString(), ", "));
                }

                log.info("addEdgesStringBuilder sql: {}", addEdgesStringBuilder);
                this.session.run(addEdgesStringBuilder.toString());
            }
        });

        log.info("插入关系总共时间：{} ms", stopWatch.getTime());
    }

    @Override
    public List<EdgeModel> addEdges(AddEdgeModel addEdgeModelList) {
        if (addEdgeModelList == null || addEdgeModelList.getType() == null) {
            return new ArrayList<>();
        }

        StringBuilder sqlStringBuilder = new StringBuilder("MATCH (n), (m) WHERE id(n) = ");
        sqlStringBuilder.append(addEdgeModelList.getStartVertexId());
        sqlStringBuilder.append(" AND id(m) = ");
        sqlStringBuilder.append(addEdgeModelList.getEndVertexId());
        sqlStringBuilder.append(" CREATE (n)-[rel:");
        sqlStringBuilder.append(addEdgeModelList.getType());
        sqlStringBuilder.append(this.getAddPropertiesSql(addEdgeModelList.getAttributeList()));
        sqlStringBuilder.append("]->(m)  RETURN rel");
        log.info("neo4j addEdge query: {}", sqlStringBuilder);
        List<EdgeModel> edgeModelList = this.session.writeTransaction(tx -> {
            Result result = tx.run(sqlStringBuilder.toString());
            List<Record> recordList = result.list();
            List<EdgeModel> emList = new ArrayList<>();
            for (Record edgeRecord : recordList) {
                if (edgeRecord.values() == null || edgeRecord.values().size() == 0) {
                    continue;
                }
                edgeRecord.values().forEach(edge -> emList.add(this.transEdge(edge.asRelationship())));
            }
            return emList;
        });
        return new ArrayList<>(edgeModelList);
    }

    @Override
    public void updateType(ModifyType modifyType) {
        if (modifyType == null || modifyType.getId() == null || modifyType.getVertex() == null) {
            throw new IllegalArgumentException("参数错误");
        }
        StringBuilder sqlStringBuilder;
        if (modifyType.getVertex()) {
            sqlStringBuilder = new StringBuilder("MATCH (n) WHERE id(n) = ");
            sqlStringBuilder.append(modifyType.getId());
            if (modifyType.getOldTypeList() != null && !modifyType.getOldTypeList().isEmpty()) {
                sqlStringBuilder.append(" REMOVE n");
                modifyType.getOldTypeList().forEach(oldType -> sqlStringBuilder.append(":").append(oldType));
            }
            if (modifyType.getNewTypeList() != null && !modifyType.getNewTypeList().isEmpty()) {
                sqlStringBuilder.append(" SET n");
                modifyType.getNewTypeList().forEach(newType -> sqlStringBuilder.append(":").append(newType));
            }
        } else {
            if (modifyType.getNewTypeList() == null || modifyType.getNewTypeList().isEmpty()) {
                throw new IllegalArgumentException("修改边的类型不能为空");
            }
            sqlStringBuilder = new StringBuilder("MATCH (n)-[r]->(m) WHERE id(r) = ");
            sqlStringBuilder.append(modifyType.getId())
                    .append(" create(n)-[r2:")
                    .append(modifyType.getNewTypeList().get(0)).append("]->(m) set r2=r with r delete r");
        }

        log.info("neo4j updateType query: {}", sqlStringBuilder);
        this.session.writeTransaction(tx -> tx.run(sqlStringBuilder.toString()));
    }

    @Override
    public void updateAttribute(ModifyAttribute modifyAttribute) {
        if (modifyAttribute.getId() == null || modifyAttribute.getAttributeModelList() == null || modifyAttribute.getVertex() == null) {
            throw new IllegalArgumentException("参数错误");
        }
        StringBuilder sqlStringBuilder;
        if (modifyAttribute.getVertex()) {
            sqlStringBuilder = new StringBuilder("MATCH (n) WHERE id(n) = ");
        } else {
            sqlStringBuilder = new StringBuilder("MATCH ()-[n]->() WHERE id(n) = ");
        }

        sqlStringBuilder.append(modifyAttribute.getId()).append(" SET ");
        modifyAttribute.getAttributeModelList().forEach(addAttributeModel -> {
            sqlStringBuilder.append("n.").append(addAttributeModel.getName()).append(" = ");
            if (addAttributeModel.getValue() instanceof String) {
                sqlStringBuilder.append("\"");
            }
            sqlStringBuilder.append(addAttributeModel.getValue());
            if (addAttributeModel.getValue() instanceof String) {
                sqlStringBuilder.append("\"");
            }
            sqlStringBuilder.append(", ");
        });

        String updateupdateAttributeSql = StrUtil.removeSuffix(sqlStringBuilder.toString(), ", ");
        log.info("neo4j updateAttribute query: {}", updateupdateAttributeSql);
        this.session.writeTransaction(tx -> tx.run(updateupdateAttributeSql));
    }

    @Override
    public void delete(Object id, Boolean vertex) {
        if (id == null || vertex == null) {
            throw new IllegalArgumentException("参数错误");
        }

        String deleteSql;
        if (vertex) {
            deleteSql = "MATCH (n) where id(n) = " + id + " DETACH DELETE n";
        } else {
            deleteSql = "MATCH ()-[r]-() WHERE id(r) = " + id + " DELETE r";
        }

        log.info("neo4j delete query: {}", deleteSql);
        this.session.writeTransaction(tx -> tx.run(deleteSql));
    }

    @Override
    public void deleteVertexType(Object id, List<String> typeList) {
        if (id == null || typeList == null) {
            throw new IllegalArgumentException("参数错误");
        }
        StringBuilder sqlStringBuilder = new StringBuilder("MATCH (n) WHERE id(n) =  ");
        sqlStringBuilder.append(id);
        sqlStringBuilder.append(" REMOVE n");
        typeList.forEach(oldType -> sqlStringBuilder.append(":").append(oldType));

        log.info("neo4j deleteType query: {}", sqlStringBuilder);
        this.session.writeTransaction(tx -> tx.run(sqlStringBuilder.toString()));
    }

    @Override
    public void deleteAttribute(Object id, List<String> attributeList, Boolean vertex) {
        if (id == null || attributeList == null) {
            throw new IllegalArgumentException("参数错误");
        }
        StringBuilder sqlStringBuilder;
        if (vertex) {
            sqlStringBuilder = new StringBuilder("MATCH (n) WHERE id(n) = ");
        } else {
            sqlStringBuilder = new StringBuilder("MATCH ()-[n]->() WHERE id(n) = ");
        }

        sqlStringBuilder.append(id).append(" REMOVE ");
        attributeList.forEach(attribute -> sqlStringBuilder.append("n.").append(attribute).append(", "));

        String deleteAttributeSql = StrUtil.removeSuffix(sqlStringBuilder.toString(), ", ");
        log.info("neo4j deleteAttribute query: {}", sqlStringBuilder);
        this.session.writeTransaction(tx -> tx.run(deleteAttributeSql));
    }

    private String getAddPropertiesSql(List<AddAttributeModel> attributeList) {
        if (attributeList == null || attributeList.isEmpty()) {
            return "";
        }

        StringBuilder attributeStringBuilder = new StringBuilder();
        attributeList.forEach(attributeModel -> {
            attributeStringBuilder.append(attributeModel.getName()).append(":");
            if (attributeModel.getValue() instanceof String) {
                attributeStringBuilder.append("\"");
            }
            attributeStringBuilder.append(attributeModel.getValue());
            if (attributeModel.getValue() instanceof String) {
                attributeStringBuilder.append("\"");
            }
            attributeStringBuilder.append(", ");
        });
        return " {" + StrUtil.removeSuffix(attributeStringBuilder.toString(), ", ") + "} ";
    }

    private StringBuilder getQueryVertexSql(GraphQuery graphQuery) {
        if (graphQuery == null) {
            throw new IllegalArgumentException("连接信息错误");
        }

        StringBuilder sqlStringBuilder = new StringBuilder("MATCH (n");

        if (graphQuery.getVertexLabelList() != null) {
            for (String vertexType : graphQuery.getVertexLabelList()) {
                sqlStringBuilder.append(":").append("`").append(vertexType).append('`');
            }
        }

        sqlStringBuilder.append(")");

        if (graphQuery.getIdList() != null && !graphQuery.getIdList().isEmpty()) {
            sqlStringBuilder.append(" WHERE ").append(" id(n) in ").append(graphQuery.getIdList());
        }

        if (StringUtils.isNotBlank(graphQuery.getQueryValue()) && StringUtils.isNotBlank(graphQuery.getAttributesKey())) {
            if (sqlStringBuilder.toString().toLowerCase(Locale.ROOT).contains("where")) {
                sqlStringBuilder.append(" AND ");
            } else {
                sqlStringBuilder.append(" WHERE ");
            }
            sqlStringBuilder.append("n.").append(graphQuery.getAttributesKey()).append("=");
            if (graphQuery.getFuzzy() != null && graphQuery.getFuzzy()) {
                sqlStringBuilder.append("~'(?i).*").append(graphQuery.getQueryValue()).append(".*' ");
            } else {
                sqlStringBuilder.append("\"").append(graphQuery.getQueryValue()).append("\"");
            }
        }
        return sqlStringBuilder;
    }

    private StringBuilder getQueryExpandSql(GraphQuery graphQuery) {
        if (graphQuery == null) {
            throw new IllegalArgumentException("连接信息错误");
        }

        StringBuilder sqlStringBuilder = new StringBuilder("MATCH p=(n)-[r");
        if (graphQuery.getEdgeTypeList() != null) {
            for (int i = 0; i < graphQuery.getEdgeTypeList().size(); i++) {
                if (i == 0) {
                    sqlStringBuilder.append(":");
                } else {
                    sqlStringBuilder.append("|");
                }
                sqlStringBuilder.append("`").append(graphQuery.getEdgeTypeList().get(i)).append("`");
            }
        }
        if (graphQuery.getDeep() != null) {
            sqlStringBuilder.append("*").append(graphQuery.getDeep());
        }
        sqlStringBuilder.append("]-(m) ");

        if (graphQuery.getIdList() != null) {
            sqlStringBuilder.append("where id(n) in ").append(graphQuery.getIdList());
        }
        return sqlStringBuilder;
    }

    private VertexModel transNode(Node node) {
        VertexModel vertexModel = new VertexModel();
        vertexModel.setId(node.id());
        vertexModel.setLabels(node.labels());

        vertexModel.setUniquelyId(node.get(this.graphConnectInfo.getNeo4jConnect().getUniquelyIdKey()).isNull()
                ? null : node.get(this.graphConnectInfo.getNeo4jConnect().getUniquelyIdKey()).asList());

        vertexModel.setName(
                node.get(this.graphConnectInfo.getNeo4jConnect().getNameKey()).isNull()
                        ? node.get("name").isNull()
                        ? node.values().iterator().hasNext()
                        ? node.values().iterator().next().asObject().toString()
                        : node.id() : node.get("name").asObject().toString()
                        : node.get(this.graphConnectInfo.getNeo4jConnect().getNameKey()).asObject().toString());

        vertexModel.setType(node.get(this.graphConnectInfo.getNeo4jConnect().getTypeKey()).isNull()
                ? null : node.get(this.graphConnectInfo.getNeo4jConnect().getTypeKey()).asObject().toString());

        List<AttributeModel> attributeModelList = new ArrayList<>();

        node.asMap().forEach((k, v) -> {
            AttributeModel attributeModel = new AttributeModel();
            attributeModel.setName(k);
            attributeModel.setValue(node.get(k).isNull() ? "" : node.get(k).asObject().toString());
            attributeModel.setFieldType(v.getClass().getSimpleName());
            attributeModelList.add(attributeModel);
        });
        vertexModel.setAttributeList(attributeModelList);
        return vertexModel;
    }

    private EdgeModel transEdge(Relationship relationship) {
        EdgeModel edgeModel = new EdgeModel();
        edgeModel.setId(relationship.id());
        edgeModel.setUniquelyId(relationship.get(this.graphConnectInfo.getNeo4jConnect().getUniquelyIdKey()).isNull()
                ? null : relationship.get(this.graphConnectInfo.getNeo4jConnect().getUniquelyIdKey()).asList());
        edgeModel.setName(relationship.get(this.graphConnectInfo.getNeo4jConnect().getNameKey()).isNull()
                ? null : relationship.get(this.graphConnectInfo.getNeo4jConnect().getNameKey()).asObject().toString());
        edgeModel.setType(relationship.get(this.graphConnectInfo.getNeo4jConnect().getTypeKey()).isNull()
                ? relationship.type() : relationship.get(this.graphConnectInfo.getNeo4jConnect().getTypeKey()).asObject().toString());

        edgeModel.setStartVertexId(relationship.startNodeId());
        edgeModel.setEndVertexId(relationship.endNodeId());

        List<AttributeModel> attributeModelList = new ArrayList<>();
        relationship.asMap().forEach((k, v) -> {
            AttributeModel attributeModel = new AttributeModel();
            attributeModel.setName(k);
            attributeModel.setValue(v);
            attributeModel.setFieldType(v.getClass().getSimpleName());
            attributeModelList.add(attributeModel);
        });
        edgeModel.setAttributeList(attributeModelList);
        return edgeModel;
    }
}
