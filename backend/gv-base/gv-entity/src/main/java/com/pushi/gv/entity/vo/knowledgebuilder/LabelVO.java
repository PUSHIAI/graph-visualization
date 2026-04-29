package com.pushi.gv.entity.vo.knowledgebuilder;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 打标签VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "打标签VO")
public class LabelVO {

    @ApiModelProperty(value = "主键", example = "_id")
    private String primaryKey;

    @ApiModelProperty(value = "主键值", example = "5345353")
    private String primaryValue;

    @ApiModelProperty(value = "标签", example = "是否是黑名单")
    private String labelKey;

    @ApiModelProperty(value = "标签值", example = "是")
    private String labelValue;

    @ApiModelProperty(value = "类型", example = "pos")
    private String type;
}
