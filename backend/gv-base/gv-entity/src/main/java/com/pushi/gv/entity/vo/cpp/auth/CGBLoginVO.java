package com.pushi.gv.entity.vo.cpp.auth;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 登录请求体VO
 *
 * @author anj
 */
@Data
@ApiModel(description = "登录请求体VO")
public class CGBLoginVO {

    /**
     * 用户账号
     */
    @ApiModelProperty(value = "用户账号", example = "admin")
    private String username;

    /**
     * 密码
     */
    @ApiModelProperty(value = "密码", example = "pushiAI000@")
    private String password;

    /**
     * 登录类型
     */
    @ApiModelProperty(value = "登录类型", example = "oa", hidden = true)
    private String loginType;
}
