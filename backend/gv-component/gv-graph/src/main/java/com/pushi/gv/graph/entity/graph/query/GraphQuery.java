package com.pushi.gv.graph.entity.graph.query;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GraphQuery {

    /**
     * idList
     */
    private List<String> idList;

    /**
     * 查询值
     */
    private String queryValue;

    /**
     * 属性字段
     */
    private String attributesKey;

    /**
     * 是否模糊查询
     */
    private Boolean fuzzy;

    /**
     * 实体类型
     */
    private List<String> vertexLabelList;

    /**
     * 关系类型
     */
    private List<String> edgeTypeList;

    /**
     * 查询深度
     */
    private Integer deep;

    /**
     * 当前页
     */
    private Long currentPage;

    /**
     * 每页条数
     */
    private Long pageSize;
}
