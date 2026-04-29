package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SchemaModel {

    private List<String> vertexList;

    private List<String> edgeList;

    private List<String> attributeList;

    private List<String> vertexIndexList;

    private List<String> edgeIndexList;

    private List<String> attributeIndexList;


    @Override
    public int hashCode() {
        int result = vertexList != null ? vertexList.hashCode() : 0;
        result = 48 * result + (edgeList != null ? edgeList.hashCode() : 0);
        result = 48 * result + (attributeList != null ? attributeList.hashCode() : 0);
        result = 48 * result + (vertexIndexList != null ? vertexIndexList.hashCode() : 0);
        result = 48 * result + (edgeIndexList != null ? edgeIndexList.hashCode() : 0);
        result = 48 * result + (attributeIndexList != null ? attributeIndexList.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "SchemaModel{" +
                "vertexList=" + vertexList +
                ", edgeList=" + edgeList +
                ", attributeList=" + attributeList +
                ", vertexIndexList=" + vertexIndexList +
                ", edgeIndexList=" + edgeIndexList +
                ", attributeIndexList=" + attributeIndexList +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof SchemaModel)) {
            return false;
        }
        SchemaModel schemaModel = (SchemaModel) obj;
        if (this == schemaModel) {
            return true;
        }
        return schemaModel.toString().equals(this.toString());
    }
}
