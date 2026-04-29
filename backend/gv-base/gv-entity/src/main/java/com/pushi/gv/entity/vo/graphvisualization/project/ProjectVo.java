package com.pushi.gv.entity.vo.graphvisualization.project;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.graphvisualization.connect.JanusConnectVo;
import com.pushi.gv.entity.vo.graphvisualization.connect.Neo4jConnectVo;

/**
 * 项目表
 */
@Getter
@Setter
@ApiModel(description = "项目Vo")
public class ProjectVo extends BaseEntityVO {

    /**
     * 项目名称
     */
    @ApiModelProperty(value = "项目名称", example = "项目")
    private String name;

    /**
     * 描述信息
     */
    @ApiModelProperty(value = "描述信息", example = "这是一条描述")
    private String description;

    /**
     * 图谱类型
     */
    @ApiModelProperty(value = "图谱类型", example = "NEO4J 或 JANUS")
    private String graphType;

    /**
     * neo4j 连接信息
     */
    @ApiModelProperty(value = "Neo4j 连接信息")
    private Neo4jConnectVo neo4jConnect;

    /**
     * janus 连接信息
     */
    @ApiModelProperty(value = "Janus 连接信息")
    private JanusConnectVo janusConnect;
}
