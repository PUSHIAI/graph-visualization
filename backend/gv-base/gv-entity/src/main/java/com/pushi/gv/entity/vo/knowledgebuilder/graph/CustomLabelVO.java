package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import java.util.Map;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 自定义Label
 *
 * @author anj
 */
@Data
@ApiModel(description = "自定义Label")
public class CustomLabelVO {

    @ApiModelProperty(value = "标签", example = "lable")
    private String label;

    @ApiModelProperty(value = "用户", example = "哈哈")
    private String user;

    @ApiModelProperty(value = "颜色")
    private String color;

    @ApiModelProperty(value = "信息")
    private Map<String, String> info;
}
