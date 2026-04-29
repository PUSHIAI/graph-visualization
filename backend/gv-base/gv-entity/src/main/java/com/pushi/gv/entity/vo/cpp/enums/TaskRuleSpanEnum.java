package com.pushi.gv.entity.vo.cpp.enums;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 盗刷排查跨度类型
 *
 * @author anj
 */
@ApiModel(description = "盗刷排查跨度类型")
public enum TaskRuleSpanEnum {

    /**
     * 之前
     */
    @ApiModelProperty(value = "之前")
    BEFORE,

    /**
     * 之后
     */
    @ApiModelProperty(value = "之后")
    AFTER
}
