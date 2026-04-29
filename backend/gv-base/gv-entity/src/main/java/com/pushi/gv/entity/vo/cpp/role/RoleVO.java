package com.pushi.gv.entity.vo.cpp.role;

import java.util.Collection;
import java.util.List;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.menu.MenuVO;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 角色VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "角色VO")
public class RoleVO extends BaseEntityVO {

    /**
     * 角色名称
     */
    @ApiModelProperty(value = "角色名称", example = "管理员")
    private String roleName;

    /**
     * 角色标识
     */
    @ApiModelProperty(value = "角色标识", example = "admin")
    private String roleSign;

    /**
     * 备注
     */
    @ApiModelProperty(value = "备注", example = "备注")
    private String description;

    /**
     * 菜单权限树形结构
     */
    @ApiModelProperty(value = "菜单权限树形结构")
    private Collection<MenuVO> menuTrees;

    /**
     * 菜单id列表
     */
    @ApiModelProperty(value = "菜单id列表")
    private List<Long> menusIdList;
}
