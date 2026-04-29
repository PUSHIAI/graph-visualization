package com.pushi.gv.entity.vo.cpp.task;

import com.pushi.gv.entity.base.BaseEntityVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 排查名单VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "排查名单VO")
public class NameListVO extends BaseEntityVO {

    /**
     * 盗刷排查任务Id
     */
    @ApiModelProperty(value = "盗刷排查任务Id", example = "1263401884173996034")
    private Long taskId;

    /**
     * 类型
     */
    @ApiModelProperty(value = "类型", example = "商户")
    private String type;

    /**
     * 名称
     */
    @ApiModelProperty(value = "名称", example = "**商户")
    private String name;

    /**
     * 编号
     */
    @ApiModelProperty(value = "编号", example = "442324242")
    private String number;

    /**
     * 起始时间
     */
    @ApiModelProperty(value = "起始时间", example = "20200512")
    private String startTime;

    /**
     * 结束时间
     */
    @ApiModelProperty(value = "结束时间", example = "20200702")
    private String endTime;
}
