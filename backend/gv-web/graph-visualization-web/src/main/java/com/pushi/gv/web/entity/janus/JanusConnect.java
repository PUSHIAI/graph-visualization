package com.pushi.gv.web.entity.janus;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.pushi.gv.web.entity.base.BaseEntity;

/**
 * Janus 连接信息
 */
@Getter
@Setter
@Entity
@Table(name = "janus_connect")
public class JanusConnect extends BaseEntity {

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
     * Janus 配置信息键值对
     */
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "janus_connect_id")
    private List<JanusConnectProperty> janusConnectProperties = new ArrayList<>();
}
