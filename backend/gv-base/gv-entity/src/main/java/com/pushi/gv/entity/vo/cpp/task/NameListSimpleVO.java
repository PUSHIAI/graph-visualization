package com.pushi.gv.entity.vo.cpp.task;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 排查名单简单VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "排查名单简单VO")
public class NameListSimpleVO {

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
