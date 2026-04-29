package com.pushi.gv.entity.vo.cpp.posmerchant;

import com.pushi.gv.entity.base.BaseEntityVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷排查商户结果VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷排查商户结果VO")
public class PosMerchantSimpleVO extends BaseEntityVO {

    /**
     * 泄漏月份
     */
    @ApiModelProperty(value = "泄漏月份")
    private String fraudDate;

    /**
     * 欺诈率
     */
    @ApiModelProperty(value = "欺诈率")
    private String fraudRate;
}
