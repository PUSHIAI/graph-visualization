package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import java.util.Collection;
import java.util.Map;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 节点实体
 *
 * @author anj
 */
@Data
@ApiModel(description = "实体")
public class NodeVO {

    @ApiModelProperty(value = "实体id（_id）", example = "4344456577432")
    private String id;

    @ApiModelProperty(value = "实体", example = "**商户")
    private String name;

    @ApiModelProperty(value = "实体类型", example = "商户")
    private String type;

    @ApiModelProperty(value = "实体概念类型", example = "ENTITY")
    private ClassType label;

    @ApiModelProperty(value = "自定义标签")
    private Collection<CustomLabelVO> customLabels;

    @ApiModelProperty(value = "标签")
    private Collection<String> tags;

    @ApiModelProperty(value = "实体属性")
    private Map<String, Object> attributes;
}
