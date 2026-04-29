package com.pushi.gv.entity.vo.cpp.enums;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 结果集下发类型
 *
 * @author anj
 */
@ApiModel(description = "结果集下发类型")
public enum IssuedTypeEnum {

    /**
     * 商户
     */
    @ApiModelProperty(value = "商户")
    MERCHANT,

    /**
     * 信用卡
     */
    @ApiModelProperty(value = "信用卡")
    CARD,

    /**
     * 所有
     */
    @ApiModelProperty(value = "所有")
    ALL
}
