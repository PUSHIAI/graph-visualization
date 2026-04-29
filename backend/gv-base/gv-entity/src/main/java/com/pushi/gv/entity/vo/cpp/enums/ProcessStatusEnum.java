package com.pushi.gv.entity.vo.cpp.enums;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 盗刷流程运行状态
 *
 * @author anj
 */
@ApiModel(description = "盗刷流程运行状态")
public enum ProcessStatusEnum {

    /**
     * 未运行
     */
    @ApiModelProperty(value = "未运行")
    NOT_RUNING("未运行"),

    /**
     * 运行中
     */
    @ApiModelProperty(value = "运行中")
    RUNING("运行中"),

    /**
     * 失败
     */
    @ApiModelProperty(value = "失败")
    FAILURE("失败"),

    /**
     * 结束
     */
    @ApiModelProperty(value = "成功")
    SUCCESS("成功");

    private final String description;


    ProcessStatusEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
