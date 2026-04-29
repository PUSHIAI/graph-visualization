package com.pushi.gv.entity.vo.cpp.menu;

import java.util.List;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.enums.MenuTypeEnum;
import com.pushi.gv.entity.vo.cpp.enums.PermissonTypeEnum;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 菜单VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "菜单VO")
public class MenuVO extends BaseEntityVO {

    /**
     * 父级Id
     */
    @ApiModelProperty(value = "父级Id", example = "1231323341342342")
    private Long parentId;

    /**
     * 菜单名称
     */
    @ApiModelProperty(value = "菜单名称", example = "首页")
    private String name;

    /**
     * 菜单URL
     */
    @ApiModelProperty(value = "菜单URL", example = "http://index")
    private String url;

    /**
     * 权限标识
     */
    @ApiModelProperty(value = "权限标识", example = "example:example:read")
    private String permissonPerms;

    /**
     * 权限类型
     */
    @ApiModelProperty(value = "权限类型", example = "READ")
    private PermissonTypeEnum permissonType;

    /**
     * 权限类型翻译
     */
    @ApiModelProperty(value = "权限类型翻译", example = "只读")
    private String permissonTypeDesc;

    /**
     * 菜单类型
     */
    @ApiModelProperty(value = "菜单类型", example = "INTERFACEORBUTTON")
    private MenuTypeEnum menuType;

    /**
     * 菜单类型翻译
     */
    @ApiModelProperty(value = "菜单类型翻译", example = "接口/按钮")
    private String menuTypeDesc;

    /**
     * 菜单等级
     */
    @ApiModelProperty(value = "菜单等级", example = "1")
    private Integer menusGrade;

    /**
     * 菜单子集
     */
    @ApiModelProperty(value = "菜单子集")
    private List<MenuVO> childrenMenu;

    /**
     * 禁止标识位
     */
    @ApiModelProperty(value = "禁止标识位", example = "false")
    private Boolean disable;
}
