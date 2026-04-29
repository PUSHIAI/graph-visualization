package com.pushi.gv.entity.vo.knowledgebuilder;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 按照节点 _id 展开图谱VO
 *
 * @author anj
 */
@Data
@ApiModel(description = "按照节点 _id 展开图谱VO")
public class ExpandNodeVO {

    @ApiModelProperty(value = "_id")
    private String nodeId;

}
