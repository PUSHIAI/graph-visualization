package com.pushi.gv.entity.vo.graphvisualization.project;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import com.pushi.gv.entity.base.BaseEntityVO;

/**
 * 项目样式Vo
 */
@Getter
@Setter
@ApiModel(description = "项目SkuVo")
public class ProjectStylesVo extends BaseEntityVO {

    /**
     * 类型名称
     */
    @ApiModelProperty(value = "类型名称", example = "人")
    private String labelName;

    /**
     * 颜色
     */
    @ApiModelProperty(value = "颜色", example = "#442")
    private String color;

    /**
     * 大小
     */
    @ApiModelProperty(value = "大小", example = "1X")
    private String size;

    /**
     * 图标
     */
    @ApiModelProperty(value = "图标", example = "people")
    private String icon;

    /**
     * 标签
     */
    @ApiModelProperty(value = "标签", example = "唯一标识")
    private String tag;

    /**
     * 是否是实体类型
     */
    @ApiModelProperty(value = "是否是实体类型", example = "true")
    private Boolean isVertexType;

    /**
     * 优先级，1代表最大的优先级，越大优先级越低
     */
    @ApiModelProperty(value = "优先级，1代表最大的优先级，越大优先级越低", example = "1")
    private Integer priority;
}
