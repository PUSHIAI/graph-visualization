package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import java.util.List;

import lombok.Data;

/**
 * 展开查询
 *
 * @author anj
 */
@Data
public class ExpandQueryVO {

    private List<String> ids;

    private List<String> nodetypes;

    private List<String> linktype;

    private Integer deep;

    private String limit;
}
