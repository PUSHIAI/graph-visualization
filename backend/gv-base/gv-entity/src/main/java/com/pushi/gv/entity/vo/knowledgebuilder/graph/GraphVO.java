package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import java.util.HashSet;
import java.util.Set;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 图谱请求类
 *
 * @param <Vertex>       点
 * @param <Relationship> 关系
 * @author anj
 */
@Data
@ApiModel(description = "图谱请求体")
public class GraphVO<Vertex extends NodeVO, Relationship extends EdgeVO> {

    @ApiModelProperty(value = "实体")
    private Set<Vertex> nodes;

    @ApiModelProperty(value = "关系")
    private Set<Relationship> links;

    @ApiModelProperty(value = "属性")
    private Object attributes;

    @ApiModelProperty(value = "标记")
    private Object markers;

    public GraphVO() {
        this.nodes = new HashSet<>(0);
        this.links = new HashSet<>(0);
    }
}
