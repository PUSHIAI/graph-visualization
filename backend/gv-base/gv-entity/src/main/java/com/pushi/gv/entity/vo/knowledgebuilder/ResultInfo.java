package com.pushi.gv.entity.vo.knowledgebuilder;

import java.io.Serializable;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 知筑师httpClient返回体
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "知筑师httpClient返回体")
public class ResultInfo implements Serializable {

    @ApiModelProperty(value = "code", example = "200")
    private Integer code;

    @ApiModelProperty(value = "返回信息", example = "哈哈哈哈哈哈哈哈")
    private String message;

    @ApiModelProperty(value = "返回数据")
    private Object data;
}
