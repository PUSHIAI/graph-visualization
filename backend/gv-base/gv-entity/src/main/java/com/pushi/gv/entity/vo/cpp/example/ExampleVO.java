package com.pushi.gv.entity.vo.cpp.example;

import com.pushi.gv.entity.base.BaseEntityVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 示例VO
 *
 * @author anj
 */
@Setter
@Getter
@ApiModel(description = "示例VO")
public class ExampleVO extends BaseEntityVO {

    /**
     * 名称
     */
    @ApiModelProperty(value = "名称", example = "名称")
    private String name;

    /**
     * 值
     */
    @ApiModelProperty(value = "值", example = "哈哈哈哈哈")
    private String value;

    /**
     * 手机号码
     */
    @ApiModelProperty(value = "手机号码", example = "18888888888")
    private String phone;
}
