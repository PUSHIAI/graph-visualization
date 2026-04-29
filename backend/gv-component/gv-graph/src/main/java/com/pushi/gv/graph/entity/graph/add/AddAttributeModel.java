package com.pushi.gv.graph.entity.graph.add;

import lombok.Getter;
import lombok.Setter;

/**
 * 属性
 */
@Getter
@Setter
public class AddAttributeModel {

    /**
     * 属性名称
     */
    private String name;

    /**
     * 是否索引
     */
    private Boolean index;

    /**
     * 属性值
     */
    private String value;
}
