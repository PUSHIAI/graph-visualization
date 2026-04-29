package com.pushi.gv.entity.vo.cpp.enums;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 盗刷排查任务类型
 *
 * @author anj
 */
@ApiModel(description = "盗刷流程任务类型")
public enum TaskTypeEnum {

    /**
     * 商户手动上传排查
     */
    @ApiModelProperty(value = "商户手动上传排查")
    MERCHANT_EXTRA,

    /**
     * 终端手动上传排查
     */
    @ApiModelProperty(value = "终端手动上传排查")
    POS_EXTRA,

    /**
     * 盗刷卡排查规则
     */
    @ApiModelProperty(value = "盗刷卡排查规则")
    NORMAL
}
