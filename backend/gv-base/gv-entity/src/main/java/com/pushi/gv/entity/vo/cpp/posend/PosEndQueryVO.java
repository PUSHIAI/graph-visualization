package com.pushi.gv.entity.vo.cpp.posend;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷排查卡结果查询VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷排查卡结果查询VO")
public class PosEndQueryVO {

    /**
     * 卡号
     */
    @ApiModelProperty(value = "卡号")
    private String cardNum;

    /**
     * 主客户号
     */
    @ApiModelProperty(value = "主客户号")
    private String mainCardCardHolderNum;

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

    /**
     * 终端编号
     */
    @ApiModelProperty(value = "终端编号")
    private String isoTermnNum;

    /**
     * 主卡人手机号
     */
    @ApiModelProperty(value = "主卡人手机号")
    private String mobileNum;

    /**
     * 是否为有效卡
     */
    @ApiModelProperty(value = "是否为有效卡")
    private String isValidCard;

    /**
     * 流水编号
     */
    @ApiModelProperty(value = "流水编号")
    private String eventNum;

    /**
     * ecif号码
     */
    @ApiModelProperty(value = "ecif号码")
    private String ecifNum;
}
