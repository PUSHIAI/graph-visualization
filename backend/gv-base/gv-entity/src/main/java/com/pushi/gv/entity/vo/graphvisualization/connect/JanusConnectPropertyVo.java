package com.pushi.gv.entity.vo.graphvisualization.connect;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * Janus 配置信息键值对
 */
@Getter
@Setter
@ApiModel(description = "Janus 配置信息键值对")
public class JanusConnectPropertyVo {

    /**
     * 键
     */
    @ApiModelProperty(value = "键", example = "gremlin.graph")
    private String key;

    /**
     * 值
     */
    @ApiModelProperty(value = "值", example = "org.janusgraph.core.JanusGraphFactory")
    private String value;
}
