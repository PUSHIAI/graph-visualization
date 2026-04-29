package com.pushi.gv.entity.vo.cpp.posmerchant;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷排查商户结果查询VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷排查商户结果查询VO")
public class PosMerchantQueryVO {

    /**
     * 商户代号
     */
    @ApiModelProperty(value = "商户代号")
    private String initMerchtNum;

    /**
     * 商户名称
     */
    @ApiModelProperty(value = "商户名称")
    private String initMerchtCnName;
}
