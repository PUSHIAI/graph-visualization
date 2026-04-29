package com.pushi.gv.graph.entity.graph.add;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 添加实体
 */
@Getter
@Setter
public class AddVertexModel {

    /**
     * 实体类型
     */
    private List<String> labels;

    /**
     * 属性列表
     */
    private List<AddAttributeModel> attributeList;
}