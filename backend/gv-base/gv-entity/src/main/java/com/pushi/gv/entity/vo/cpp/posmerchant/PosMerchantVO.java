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
public class PosMerchantVO extends BaseEntityVO {

    /**
     * 流程状态Id
     */
    @ApiModelProperty(value = "流程状态Id", example = "56345234432342")
    private Long processId;

    /**
     * 批次号
     */
    @ApiModelProperty(value = "批次号", example = "20200520")
    private String batchDate;

    /**
     * 商户名称
     */
    @ApiModelProperty(value = "商户名称")
    private String initMerchtCnName;

    /**
     * 商户代号
     */
    @ApiModelProperty(value = "商户代号")
    private String initMerchtNum;

    /**
     * 开始泄漏日期
     */
    @ApiModelProperty(value = "开始泄漏日期")
    private String startLeakDate;

    /**
     * 结束泄漏日期
     */
    @ApiModelProperty(value = "结束泄漏日期")
    private String endLeakDate;

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

    /**
     * 伪冒卡数量
     */
    @ApiModelProperty(value = "伪冒卡数量")
    private String fakeCardCount;

    /**
     * 卡总数量
     */
    @ApiModelProperty(value = "卡总数量")
    private String totalCardCount;

    /**
     * 对齐的字段
     */
    @ApiModelProperty(value = "对齐的字段")
    private String alignMerchtName;

    /**
     * pos终端序列号
     */
    @ApiModelProperty(value = "pos终端序列号")
    private String isoTermnNum;

    /**
     * 收单行唯一标识
     */
    @ApiModelProperty(value = "收单行唯一标识")
    private String recvBillBankIca;

    /**
     * 维度
     */
    @ApiModelProperty(value = "维度")
    private String dimension;
}
