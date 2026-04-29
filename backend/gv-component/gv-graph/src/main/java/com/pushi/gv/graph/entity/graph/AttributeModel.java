package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

/**
 * 属性
 */
@Getter
@Setter
public class AttributeModel {

    /**
     * 属性名称
     */
    private String name;

    /**
     * 属性值
     */
    private Object value;

    /**
     * 属性字段类型
     */
    private String fieldType;

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 45 * result + (value != null ? value.hashCode() : 0);
        result = 45 * result + (fieldType != null ? fieldType.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "AttributeModel{" +
                "name='" + name + '\'' +
                ", value=" + value +
                ", fieldType='" + fieldType + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof AttributeModel)) {
            return false;
        }
        AttributeModel attributeModel = (AttributeModel) obj;
        if (this == attributeModel) {
            return true;
        }
        return attributeModel.toString().equals(this.toString());
    }
}
