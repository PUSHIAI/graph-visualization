package com.pushi.gv.entity.vo.cpp.task;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.enums.TaskRuleSpanEnum;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷卡排查规则VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷卡排查规则VO")
public class RuleVO extends BaseEntityVO {

    /**
     * 盗刷排查任务Id
     */
    @ApiModelProperty(value = "盗刷排查任务Id", example = "1263401884173996034")
    private Long taskId;

    /**
     * 盗刷卡片时间跨度
     */
    @ApiModelProperty(value = "盗刷卡片时间跨度", example = "12")
    private Integer fakeCardAmountMonth;

    /**
     * 交易时间跨度
     */
    @ApiModelProperty(value = "交易时间跨度", example = "18")
    private Integer transAmountMonth;

    /**
     * 排查维度 (排查可疑共同交易点)
     */
    @ApiModelProperty(value = "排查维度 (排查可疑共同交易点)", example = "商户")
    private String dimension;

    /**
     * 可疑泄漏点 (排查可疑共同交易点)
     */
    @ApiModelProperty(value = "可疑泄漏点 (排查可疑共同交易点)", example = "3")
    private Integer leakagePoint;

    /**
     * 欺诈覆盖率
     */
    @ApiModelProperty(value = "欺诈覆盖率", example = "0.2")
    private Double fraudRate;

    /**
     * 盗刷排查跨度类型
     */
    @ApiModelProperty(value = "盗刷排查跨度类型", example = "BEFORE")
    private TaskRuleSpanEnum span;

    /**
     * 排查拓宽时间跨度
     */
    @ApiModelProperty(value = "排查拓宽时间跨度", example = "2")
    private Integer amountDay;
}
