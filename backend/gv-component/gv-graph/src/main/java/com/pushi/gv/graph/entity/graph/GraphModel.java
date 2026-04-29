package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class GraphModel {

    Set<VertexModel> vertexList;

    Set<EdgeModel> edgeList;

    public GraphModel() {
        this.vertexList = new HashSet<>();
        this.edgeList = new HashSet<>();
    }

    @Override
    public int hashCode() {
        int result = vertexList != null ? vertexList.hashCode() : 0;
        result = 47 * result + (edgeList != null ? edgeList.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "GraphModel{" +
                "vertexList=" + vertexList +
                ", edgeList=" + edgeList +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof GraphModel)) {
            return false;
        }
        GraphModel graphModel = (GraphModel) obj;
        if (this == graphModel) {
            return true;
        }
        return graphModel.toString().equals(this.toString());
    }
}
