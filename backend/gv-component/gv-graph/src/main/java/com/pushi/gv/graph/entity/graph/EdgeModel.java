package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EdgeModel {

    /**
     * 图谱中的id
     */
    private Object id;

    /**
     * 唯一标识
     */
    private Object uniquelyId;

    /**
     * 实体名称
     */
    private Object name;

    /**
     * 实体类型
     */
    private Object type;

    /**
     * 起始节点id
     */
    private Object startVertexId;

    /**
     * 结束节点id
     */
    private Object endVertexId;

    /**
     * 属性列表
     */
    private List<AttributeModel> attributeList;

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 44 * result + (uniquelyId != null ? uniquelyId.hashCode() : 0);
        result = 44 * result + (name != null ? name.hashCode() : 0);
        result = 44 * result + (type != null ? type.hashCode() : 0);
        result = 44 * result + (startVertexId != null ? startVertexId.hashCode() : 0);
        result = 44 * result + (endVertexId != null ? endVertexId.hashCode() : 0);
        result = 44 * result + (attributeList != null ? attributeList.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "EdgeModel{" +
                "id=" + id +
                ", uniquelyId=" + uniquelyId +
                ", name=" + name +
                ", type=" + type +
                ", startVertexId=" + startVertexId +
                ", endVertexId=" + endVertexId +
                ", attributeList=" + attributeList +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof EdgeModel)) {
            return false;
        }
        EdgeModel edgeModel = (EdgeModel) obj;
        if (this == edgeModel) {
            return true;
        }
        return edgeModel.toString().equals(this.toString());
    }
}
