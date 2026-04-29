package com.pushi.gv.entity.vo.graphvisualization.connect;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * Neo4j 连接信息
 */
@Getter
@Setter
@ApiModel(description = "Neo4j 连接信息Vo")
public class Neo4jConnectVo {

    /**
     * 唯一标识属性名（标识当前实体的唯一性）
     */
    @ApiModelProperty(value = "唯一标识属性名（标识当前实体的唯一性）", example = "_id")
    private String uniquelyIdKey;

    /**
     * 实体名称属性名（当作实体的名称）
     */
    @ApiModelProperty(value = "实体名称属性名（当作实体的名称）", example = "name")
    private String nameKey;

    /**
     * 实体类型属性名（当作实体的类型）
     */
    @ApiModelProperty(value = "实体类型属性名（当作实体的类型）", example = "type")
    private String typeKey;

    /**
     * Neo4j 的 bolt 连接
     */
    @ApiModelProperty(value = "Neo4j 的 bolt 连接", example = "bolt://127.0.0.1:7689")
    private String bolt;

    /**
     * 用户名
     */
    @ApiModelProperty(value = "用户名", example = "admin")
    private String userName;

    /**
     * 密码
     */
    @ApiModelProperty(value = "密码", example = "!QAZ2wsx")
    private String password;
}
