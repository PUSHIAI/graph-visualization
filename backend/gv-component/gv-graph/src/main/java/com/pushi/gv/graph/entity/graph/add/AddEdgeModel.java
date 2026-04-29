package com.pushi.gv.graph.entity.graph.add;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AddEdgeModel {

    /**
     * 实体类型
     */
    private String type;

    /**
     * 起始节点id
     */
    private Object startVertexId;

    /**
     * 结束节点id
     */
    private Object endVertexId;

    /**
     * 属性列表
     */
    private List<AddAttributeModel> attributeList;
}
