package com.pushi.gv.entity.vo.cpp.process;

import java.util.Date;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.enums.ProcessStatusEnum;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 运行状态VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "运行状态VO")
public class ProcessVO extends BaseEntityVO {

    /**
     * 盗刷排查任务Id
     */
    @ApiModelProperty(value = "盗刷排查任务Id", example = "533452453366757")
    private Long taskId;

    /**
     * 名称
     */
    @ApiModelProperty(value = "名称", example = "流程1")
    private String name;

    /**
     * 批次号
     */
    @ApiModelProperty(value = "批次号", example = "20200520")
    private String batchDate;

    /**
     * 状态
     */
    @ApiModelProperty(value = "状态", example = "FINISH")
    private ProcessStatusEnum status;

    /**
     * 状态描述
     */
    @ApiModelProperty(value = "状态描述", example = "结束")
    private String statusDesc;

    /**
     * 启动时间
     */
    @ApiModelProperty(value = "启动时间", example = "123231233242")
    private Date startTime;

    /**
     * 结束时间
     */
    @ApiModelProperty(value = "结束时间", example = "123231233242")
    private Date finishTime;

    /**
     * 运行任务Id
     */
    @ApiModelProperty(value = "运行任务Id", example = "application_343424124124142")
    private String statusId;

    /**
     * 是否已统计
     */
    @ApiModelProperty(value = "是否已统计", example = "true")
    private Boolean isCount;

    /**
     * 总数
     */
    @ApiModelProperty(value = "总数", example = "80")
    private Long totalCount;

    /**
     * 新增
     */
    @ApiModelProperty(value = "新增", example = "20")
    private Long addCount;
}
