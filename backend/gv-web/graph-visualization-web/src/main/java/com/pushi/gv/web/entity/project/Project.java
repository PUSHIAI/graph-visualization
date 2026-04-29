package com.pushi.gv.web.entity.project;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.OrderBy;
import javax.persistence.Table;

import com.pushi.gv.web.entity.base.BaseEntity;
import com.pushi.gv.web.entity.janus.JanusConnect;
import com.pushi.gv.web.entity.neo4j.Neo4jConnect;
import com.pushi.gv.graph.entity.enums.GraphTypeEnum;

/**
 * 项目
 */
@Getter
@Setter
@Entity
@Table(name = "project")
public class Project extends BaseEntity {

    /**
     * 项目名称
     */
    private String name;

    /**
     * 描述信息
     */
    private String description;

    /**
     * 图谱类型
     */
    private GraphTypeEnum graphType;

    /**
     * Neo4j 连接信息
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "neo4j_connect_id")
    private Neo4jConnect neo4jConnect;

    /**
     * Janus 连接信息
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "janus_connect_id")
    private JanusConnect janusConnect;

    /**
     * 图谱项目sku
     */
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "project_id")
    @OrderBy("priority ASC NULLS LAST")
    private List<ProjectStyle> projectStyles;
}
