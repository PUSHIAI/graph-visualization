package com.pushi.gv.graph.entity.connect;

import lombok.Getter;
import lombok.Setter;

import com.pushi.gv.graph.entity.enums.GraphTypeEnum;

/**
 * 连接信息
 */
@Getter
@Setter
public class GraphConnectInfo {

    /**
     * 图谱类型
     */
    private GraphTypeEnum graphType;

    /**
     * neo4j 连接信息
     */
    private Neo4jConnectInfo neo4jConnect;

    /**
     * janus 连接信息
     */
    private JanusConnectInfo janusConnect;

    @Override
    public int hashCode() {
        int result = graphType != null ? graphType.hashCode() : 0;
        result = 43 * result + (neo4jConnect != null ? neo4jConnect.hashCode() : 0);
        result = 43 * result + (janusConnect != null ? janusConnect.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "GraphConnectInfo{" +
                "graphType=" + graphType +
                ", neo4jConnect=" + neo4jConnect +
                ", janusConnect=" + janusConnect +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof GraphConnectInfo)) {
            return false;
        }
        GraphConnectInfo graphConnectInfo = (GraphConnectInfo) obj;
        if (this == graphConnectInfo) {
            return true;
        }
        return graphConnectInfo.toString().equals(this.toString());
    }
}
