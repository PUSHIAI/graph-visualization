package com.pushi.gv.web.entity.neo4j;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.pushi.gv.web.entity.base.BaseEntity;

/**
 * Neo4j 连接信息
 */
@Getter
@Setter
@Entity
@Table(name = "neo4j_connect")
public class Neo4jConnect extends BaseEntity {

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
}
