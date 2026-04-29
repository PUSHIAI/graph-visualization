package com.pushi.gv.entity.vo.cpp.enums;

/**
 * 权限枚举
 *
 * @author anj
 */
public enum MenuTypeEnum {

    /**
     * 菜单
     */
    MENU("菜单"),


    /**
     * 目录
     */
    DIRECTORY("目录"),

    /**
     * 接口
     */
    INTERFACE("接口"),

    /**
     * 接口/按钮
     */
    INTERFACEORBUTTON("接口/按钮"),

    /**
     * 按钮
     */
    BUTTON("按钮");

    private String desc;

    MenuTypeEnum(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }
}

