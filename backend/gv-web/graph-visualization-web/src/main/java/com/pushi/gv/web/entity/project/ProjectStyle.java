package com.pushi.gv.web.entity.project;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.pushi.gv.web.entity.base.BaseEntity;

/**
 * 项目样式
 */
@Getter
@Setter
@Entity
@Table(name = "project_style")
public class ProjectStyle extends BaseEntity {

    /**
     * 标签名称
     */
    private String labelName;

    /**
     * 颜色
     */
    private String color;

    /**
     * 大小
     */
    private String size;

    /**
     * 图标
     */
    private String icon;

    /**
     * 标签
     */
    private String tag;

    /**
     * 是否是实体类型
     */
    private Boolean isVertexType;

    /**
     * 优先级，1代表最大的优先级，越大优先级越低
     */
    private Integer priority;
}
