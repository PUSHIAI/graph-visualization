package com.pushi.gv.entity.vo.cpp.enums;

/**
 * 权限枚举
 *
 * @author anj
 */
public enum PermissonTypeEnum {

    /**
     * 没权限标识
     */
    NOT_PERMISSON("没权限标识"),

    /**
     * 只读
     */
    READ("只读"),

    /**
     * 添加
     */
    ADD("添加"),

    /**
     * 修改
     */
    MODIFY("修改"),

    /**
     * 删除
     */
    DELETE("删除");

    private String desc;

    PermissonTypeEnum(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }
}

