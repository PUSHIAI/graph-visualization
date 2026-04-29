package com.pushi.gv.graph.entity.connect;

import lombok.Getter;
import lombok.Setter;

/**
 * Neo4j 连接信息
 */
@Getter
@Setter
public class Neo4jConnectInfo {

    /**
     * 唯一标识key
     */
    private String uniquelyIdKey;

    /**
     * 实体名称key
     */
    private String nameKey;

    /**
     * 类型Key
     */
    private String typeKey;

    /**
     * bolt 连接
     */
    private String bolt;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 密码
     */
    private String password;

    @Override
    public int hashCode() {
        int result = uniquelyIdKey != null ? uniquelyIdKey.hashCode() : 0;
        result = 31 * result + (nameKey != null ? nameKey.hashCode() : 0);
        result = 31 * result + (typeKey != null ? typeKey.hashCode() : 0);
        result = 31 * result + (bolt != null ? bolt.hashCode() : 0);
        result = 31 * result + (userName != null ? userName.hashCode() : 0);
        result = 31 * result + (password != null ? password.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Neo4jConnectInfo{" +
                "uniquelyIdKey='" + uniquelyIdKey + '\'' +
                ", nameKey='" + nameKey + '\'' +
                ", typeKey='" + typeKey + '\'' +
                ", bolt='" + bolt + '\'' +
                ", userName='" + userName + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Neo4jConnectInfo)) {
            return false;
        }
        Neo4jConnectInfo neo4jConnectInfo = (Neo4jConnectInfo) obj;
        if (this == neo4jConnectInfo) {
            return true;
        }
        return neo4jConnectInfo.toString().equals(toString());
    }
}
