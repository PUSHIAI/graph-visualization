package com.pushi.gv.entity.vo.cpp.posend;

import com.pushi.gv.entity.base.BaseEntityVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷排查卡结果VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷排查卡结果VO")
public class PosEndVO extends BaseEntityVO {

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
     * 副客户号
     */
    @ApiModelProperty(value = "副客户号")
    private String suppCardCardHolderNum;

    /**
     * 上标日期
     */
    @ApiModelProperty(value = "上标日期")
    private String superscriptDate;

    /**
     * 短信日期
     */
    @ApiModelProperty(value = "短信日期")
    private String messageDate;

    /**
     * 外呼日期
     */
    @ApiModelProperty(value = "外呼日期")
    private String outcallDate;

    /**
     * 数据来源
     */
    @ApiModelProperty(value = "数据来源")
    private String dataSource;

    /**
     * CPP标识
     */
    @ApiModelProperty(value = "CPP标识")
    private String cppRiskInd;

    /**
     * 处理方式
     */
    @ApiModelProperty(value = "处理方式")
    private String processingMethod;

    /**
     * 排查维度
     */
    @ApiModelProperty(value = "排查维度")
    private String dimension;

    /**
     * 测录地区
     */
    @ApiModelProperty(value = "测录地区")
    private String nationZoneCd;

    /**
     * 备注
     */
    @ApiModelProperty(value = "备注")
    private String remarks;

    /**
     * 泄漏日期
     */
    @ApiModelProperty(value = "泄漏日期")
    private String txDt;

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
     * 收单机构号
     */
    @ApiModelProperty(value = "收单机构号")
    private String recvBillBankIca;

    /**
     * 交易货币
     */
    @ApiModelProperty(value = "交易货币")
    private String txCurrCd;

    /**
     * 交易金额
     */
    @ApiModelProperty(value = "交易金额")
    private String txAmt;

    /**
     * POS_MODE
     */
    @ApiModelProperty(value = "POS_MODE")
    private String slotCardMode;

    /**
     * 交易渠道
     */
    @ApiModelProperty(value = "交易渠道")
    private String authTxChanTypeCd;

    /**
     * 交易类型
     */
    @ApiModelProperty(value = "交易类型")
    private String authTxTypeCd;

    /**
     * 授权回应
     */
    @ApiModelProperty(value = "授权回应")
    private String intRespCd;

    /**
     * MCC
     */
    @ApiModelProperty(value = "MCC")
    private String initMerchtMcc;

    /**
     * 移动支付类型
     */
    @ApiModelProperty(value = "移动支付类型")
    private String movePayTypeCd;

    /**
     * 卡版代号
     */
    @ApiModelProperty(value = "卡版代号")
    private String indiCardEditNum;

    /**
     * 卡版
     */
    @ApiModelProperty(value = "卡版")
    private String indiCard;

    /**
     * 卡等级
     */
    @ApiModelProperty(value = "卡等级")
    private String cardLevelCd;

    /**
     * 主卡人VIP域
     */
    @ApiModelProperty(value = "主卡人VIP域")
    private String vipLevel;

    /**
     * 主卡人星级域
     */
    @ApiModelProperty(value = "主卡人星级域")
    private String custStarLevelRegCd;

    /**
     * 主卡人综授额度
     */
    @ApiModelProperty(value = "主卡人综授额度")
    private String currConsmLimit;

    /**
     * 主卡人手机号
     */
    @ApiModelProperty(value = "主卡人手机号")
    private String mobileNum;

    /**
     * 是否高端
     */
    @ApiModelProperty(value = "是否高端")
    private String isVipPerson;

    /**
     * 主卡人不良标识
     */
    @ApiModelProperty(value = "主卡人不良标识")
    private String currNpIndCd;

    /**
     * 主卡人通讯地址
     */
    @ApiModelProperty(value = "主卡人通讯地址")
    private String postAddr;

    /**
     * 主卡人公司名称
     */
    @ApiModelProperty(value = "主卡人公司名称")
    private String workCorp;

    /**
     * 卡片封锁码
     */
    @ApiModelProperty(value = "卡片封锁码")
    private String cardLockCode;

    /**
     * 账户封锁码
     */
    @ApiModelProperty(value = "账户封锁码")
    private String accountLockCode;

    /**
     * 主卡人客户封锁码
     */
    @ApiModelProperty(value = "主卡人客户封锁码")
    private String mainCrdtCardLockCd;

    /**
     * 副卡人客户封锁码
     */
    @ApiModelProperty(value = "副卡人客户封锁码")
    private String suppCrdtCardLockCd;

    /**
     * 卡片状态
     */
    @ApiModelProperty(value = "卡片状态")
    private String cardStatus;

    /**
     * 账户状态
     */
    @ApiModelProperty(value = "账户状态")
    private String acctStatusCd;

    /**
     * 卡片有效期
     */
    @ApiModelProperty(value = "卡片有效期")
    private String cardValidPeriod;

    /**
     * 旧卡有效期
     */
    @ApiModelProperty(value = "旧卡有效期")
    private String lastCardValidDt;

    /**
     * 制卡日期
     */
    @ApiModelProperty(value = "制卡日期")
    private String makeCardDt;

    /**
     * 卡片介质
     */
    @ApiModelProperty(value = "卡片介质")
    private String cardMedCd;

    /**
     * 激活日期
     */
    @ApiModelProperty(value = "激活日期")
    private String currDrawCardDt;

    /**
     * 激活标志
     */
    @ApiModelProperty(value = "激活标志")
    private String actvInd;

    /**
     * 激活原因
     */
    @ApiModelProperty(value = "激活原因")
    private String actvReasonCd;

    /**
     * 使用率参数
     */
    @ApiModelProperty(value = "使用率参数")
    private String useRateLimitCodeNum;

    /**
     * 备注2
     */
    @ApiModelProperty(value = "备注2")
    private String remarksTwo;

    /**
     * 备注3
     */
    @ApiModelProperty(value = "备注3")
    private String remarksThree;

    /**
     * 返回日期
     */
    @ApiModelProperty(value = "返回日期")
    private String returnDate;

    /**
     * 一级处理结果
     */
    @ApiModelProperty(value = "一级处理结果")
    private String primaryProcessingResults;

    /**
     * 二级处理结果
     */
    @ApiModelProperty(value = "二级处理结果")
    private String secondaryProcessingResults;

    /**
     * 备注4
     */
    @ApiModelProperty(value = "备注4")
    private String remarksFour;

    /**
     * 备注5
     */
    @ApiModelProperty(value = "备注5")
    private String remarksFive;

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
     * 客户封锁码
     */
    @ApiModelProperty(value = "客户封锁码")
    private String personLockCode;

    /**
     * ecif号码
     */
    @ApiModelProperty(value = "ecif号码")
    private String ecifNum;
}
