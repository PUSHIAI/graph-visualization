package com.pushi.gv.web.entity.janus;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.pushi.gv.web.entity.base.BaseEntity;

/**
 * Janus 配置信息键值对
 */
@Getter
@Setter
@Entity
@Table(name = "janus_connect_property")
public class JanusConnectProperty extends BaseEntity {

    /**
     * 键
     */
    private String key;

    /**
     * 值
     */
    private String value;
}
