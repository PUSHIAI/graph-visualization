package com.pushi.gv.entity.vo.cpp.enums;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 数据打标类型
 *
 * @author anj
 */
@ApiModel(description = "数据打标类型")
public enum DataMarkingTypeEnum {

    /**
     * 商户
     */
    @ApiModelProperty(value = "商户")
    MERCHANT("商户"),

    /**
     * 信用卡
     */
    @ApiModelProperty(value = "信用卡")
    CARD("卡"),

    /**
     * 终端
     */
    @ApiModelProperty(value = "终端")
    POS("终端");

    private String desc;

    DataMarkingTypeEnum(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }
}
