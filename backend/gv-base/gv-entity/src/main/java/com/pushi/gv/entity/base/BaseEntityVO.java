package com.pushi.gv.entity.base;

import java.io.Serializable;
import java.util.Date;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 基础EntityVO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "基础VO")
public class BaseEntityVO implements Serializable {

    private static final long serialVersionUID = -1L;

    @ApiModelProperty(value = "id", example = "1111111111")
    private Long id;

    @ApiModelProperty(value = "创建时间", example = "1590053457000")
    private Date createTime;

    @ApiModelProperty(value = "更新时间", example = "1590053457000")
    private Date updateTime;

    @ApiModelProperty(value = "创建者", example = "创建人")
    private String createUser;

    @ApiModelProperty(value = "更新者", example = "更新人")
    private String updateUser;
}
