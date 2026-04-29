package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import lombok.Data;

import java.util.List;

/**
 * @author : fangjie
 * @date : 2020/9/1
 */
@Data
public class ExpandParam {
    private List<String> ids;

    private String nodeTypes = "";

    private String edgeTypes = "";

    private Integer deep = 1;

    private Integer limit = -1;

}
