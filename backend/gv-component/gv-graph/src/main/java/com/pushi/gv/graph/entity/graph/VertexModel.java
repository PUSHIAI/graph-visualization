package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 实体
 */
@Getter
@Setter
public class VertexModel {

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
    private Object labels;

    /**
     * 自定义实体类型
     */
    private Object type;

    /**
     * 属性列表
     */
    private List<AttributeModel> attributeList;

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 46 * result + (uniquelyId != null ? uniquelyId.hashCode() : 0);
        result = 46 * result + (name != null ? name.hashCode() : 0);
        result = 46 * result + (type != null ? type.hashCode() : 0);
        result = 46 * result + (attributeList != null ? attributeList.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "VertexModel{" +
                "id=" + id +
                ", uniquelyId=" + uniquelyId +
                ", name=" + name +
                ", type=" + type +
                ", attributeList=" + attributeList +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof VertexModel)) {
            return false;
        }
        VertexModel vertexModel = (VertexModel) obj;
        if (this == vertexModel) {
            return true;
        }
        return vertexModel.toString().equals(this.toString());
    }
}