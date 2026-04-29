package com.pushi.gv.entity.vo.graphvisualization.connect;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * janus 连接信息
 */
@Getter
@Setter
@ApiModel(description = "Janus 连接信息Vo")
public class JanusConnectVo {

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
     * janus 连接配置信息
     */
    @ApiModelProperty(value = "Janus 配置信息键值对列表")
    private List<JanusConnectPropertyVo> janusConnectProperties;
}
