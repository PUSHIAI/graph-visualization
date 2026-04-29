package com.pushi.gv.entity.vo.cpp.user;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.alibaba.fastjson.annotation.JSONField;
import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.role.RoleVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 用户VO
 *
 * @author anj
 */
@Setter
@Getter
@ApiModel(description = "用户VO")
public class UserVO extends BaseEntityVO {

    /**
     * 账号名称
     */
    @ApiModelProperty(value = "账号名称", example = "admin")
    private String accountName;

    /**
     * 密码
     */
    @JSONField(serialize = false)
    @ApiModelProperty(value = "密码", example = "pushiAI000@")
    private String password;

    /**
     * 昵称
     */
    @ApiModelProperty(value = "昵称", example = "管理员")
    private String nickName;

    /**
     * 电子邮箱
     */
    @ApiModelProperty(value = "电子邮箱", example = "sp******nj@gmail.com")
    private String email;

    /**
     * 电话号码
     */
    @ApiModelProperty(value = "电话号码", example = "188888888888")
    private String phone;

    /**
     * 角色信息
     */
    @ApiModelProperty(value = "角色信息")
    private Map<Long, String> roleMap;

    /**
     * 权限信息列表
     */
    @ApiModelProperty(value = "权限信息列表")
    private Set<String> promissionList;

    /**
     * 包含的角色列表信息
     */
    @ApiModelProperty(value = "包含的角色列表信息")
    private List<RoleVO> roleList;

    /**
     * 是否是管理员
     */
    @ApiModelProperty(value = "是否是管理员")
    private Boolean admin;
}
