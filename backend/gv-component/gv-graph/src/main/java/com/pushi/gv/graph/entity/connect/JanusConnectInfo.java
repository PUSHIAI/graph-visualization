package com.pushi.gv.graph.entity.connect;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * janus 连接信息
 */
@Getter
@Setter
public class JanusConnectInfo {

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
     * janus 连接配置信息
     */
    private List<JanusConnectPropertyInfo> janusConnectProperties;

    @Override
    public int hashCode() {
        int result = uniquelyIdKey != null ? uniquelyIdKey.hashCode() : 0;
        result = 17 * result + (nameKey != null ? nameKey.hashCode() : 0);
        result = 17 * result + (typeKey != null ? typeKey.hashCode() : 0);
        result = 17 * result + (janusConnectProperties != null ? janusConnectProperties.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "JanusConnectInfo{" +
                "uniquelyIdKey='" + uniquelyIdKey + '\'' +
                ", nameKey='" + nameKey + '\'' +
                ", typeKey='" + typeKey + '\'' +
                ", janusConnectProperties=" + janusConnectProperties +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof JanusConnectInfo)) {
            return false;
        }
        JanusConnectInfo janusConnectInfo = (JanusConnectInfo) obj;
        if (this == janusConnectInfo) {
            return true;
        }
        return janusConnectInfo.toString().equals(toString());
    }
}
