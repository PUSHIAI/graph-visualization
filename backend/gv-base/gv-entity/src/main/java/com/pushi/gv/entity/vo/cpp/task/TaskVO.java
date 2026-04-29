package com.pushi.gv.entity.vo.cpp.task;

import java.util.List;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.enums.TaskTypeEnum;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 盗刷排查任务VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "盗刷排查任务VO")
public class TaskVO extends BaseEntityVO {

    /**
     * 流程名称
     */
    @ApiModelProperty(value = "流程名称", example = "流程1")
    private String name;

    /**
     * 描述
     */
    @ApiModelProperty(value = "流程描述", example = "这是个萌萌哒的流程")
    private String description;

    /**
     * 任务类型
     */
    @ApiModelProperty(value = "任务类型", example = "MANUAL")
    private TaskTypeEnum type;

    /**
     * 商户/终端上传排查名单
     */
    @ApiModelProperty(value = "商户/终端上传排查名单")
    private List<NameListVO> nameList;

    /**
     * 盗刷卡排查规则
     */
    @ApiModelProperty(value = "盗刷卡排查规则")
    private RuleVO rule;

    /**
     * 默认批次流程
     */
    @ApiModelProperty(value = "默认批次流程")
    private Boolean defaultBatchTask;
}
