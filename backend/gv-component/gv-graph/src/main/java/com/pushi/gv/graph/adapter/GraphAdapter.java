package com.pushi.gv.graph.adapter;

import java.util.List;

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


public abstract class GraphAdapter {

    protected GraphConnectInfo graphConnectInfo;

    public GraphAdapter(GraphConnectInfo graphConnectInfo) {
        this.graphConnectInfo = graphConnectInfo;
    }

    /**
     * 打开图谱
     */
    public abstract void openGraph();

    /**
     * 重新打开图谱
     */
    public abstract void reOpenGraph();

    /**
     * 图谱是否打开
     *
     * @return 是否打开
     */
    public abstract Boolean isOpen();

    /**
     * 关闭图谱
     */
    public abstract void close();

    /**
     * 获取 schema
     *
     * @return SchemaModel
     */
    public abstract SchemaModel getSchema();

    /**
     * 获取所有属性名称
     *
     * @return 属性名称
     */
    public abstract List<String> getAllAttributes();

    /**
     * 获取实体列表
     *
     * @param graphQuery 图查询类
     * @return 实体列表
     */
    public abstract List<VertexModel> getVertexs(GraphQuery graphQuery);

    /**
     * 统计
     *
     * @param graphQuery 图查询类
     * @return 统计数量
     */
    public abstract Long count(GraphQuery graphQuery);

    /**
     * 图展开
     *
     * @param graphQuery 图查询类
     * @return GraphModel
     */
    public abstract GraphModel expand(GraphQuery graphQuery);

    /**
     * 查询点的id是否存在图谱总
     *
     * @param graphQuery 图查询类
     * @return ExistModel
     */
    public abstract ExistModel queryExist(GraphQuery graphQuery);

    /**
     * 多个结点两两间的最短路径
     *
     * @param graphQuery 图查询类
     * @return GraphModel
     */
    public abstract GraphModel shortPath(GraphQuery graphQuery);

    /**
     * 批量添加实体
     *
     * @param addVertexModelList 添加实体列表
     */
    public abstract void batchAddVertexs(List<AddVertexModel> addVertexModelList);

    /**
     * 单个添加实体
     *
     * @param addVertexModel 添加实体方法
     */
    public abstract VertexModel addVertex(AddVertexModel addVertexModel);

    /**
     * 添加关系
     *
     * @param addEdgeModelList 添加关系列表
     * @return
     */
    public abstract void batchAddEdges(List<AddEdgeModel> addEdgeModelList);

    /**
     * 添加关系
     *
     * @param addEdgeModel 添加关系列表
     * @return
     */
    public abstract List<EdgeModel> addEdges(AddEdgeModel addEdgeModel);

    /**
     * 修改实体或关系类型
     *
     * @param modifyType 修改类型
     */
    public abstract void updateType(ModifyType modifyType);

    /**
     * 修改实体或关系属性
     *
     * @param modifyAttribute 修改属性
     */
    public abstract void updateAttribute(ModifyAttribute modifyAttribute);

    /**
     * 删除实体或关系
     *
     * @param id     实体或者关系 id
     * @param vertex 是否是实体
     */
    public abstract void delete(Object id, Boolean vertex);

    /**
     * 删除实体类型
     *
     * @param id       实体或者关系 id
     * @param typeList 类型列表
     */
    public abstract void deleteVertexType(Object id, List<String> typeList);

    /**
     * 删除实体或官修属性
     *
     * @param id            实体或者关系 id
     * @param attributeList 属性列表
     * @param vertex        是否是实体
     */
    public abstract void deleteAttribute(Object id, List<String> attributeList, Boolean vertex);
}
