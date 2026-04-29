package com.pushi.gv.graph.entity.connect;

import lombok.Getter;
import lombok.Setter;

/**
 * Janus 配置信息键值对
 */
@Getter
@Setter
public class JanusConnectPropertyInfo {

    /**
     * 键
     */
    private String key;

    /**
     * 值
     */
    private String value;

    @Override
    public int hashCode() {
        int result = key != null ? key.hashCode() : 0;
        result = 34 * result + (value != null ? value.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "JanusConnectPropertyInfo{" +
                "key='" + key + '\'' +
                ", value='" + value + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof JanusConnectPropertyInfo)) {
            return false;
        }
        JanusConnectPropertyInfo janusConnectPropertyInfo = (JanusConnectPropertyInfo) obj;
        if (this == janusConnectPropertyInfo) {
            return true;
        }
        return janusConnectPropertyInfo.toString().equals(toString());
    }
}
