package com.pushi.gv.entity.vo.knowledgebuilder;

import java.util.HashMap;
import java.util.Map;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 图库计数
 *
 * @author anj
 */
@Data
@ApiModel(description = "图库计数")
public class CountVO {

    @ApiModelProperty(value = "点")
    Map<String, String> vertex = new HashMap<>();

    @ApiModelProperty(value = "边")
    Map<String, String> edge = new HashMap<>();

    @ApiModelProperty(value = "点总数")
    Long totalVertex = 0L;

    @ApiModelProperty(value = "边总数")
    Long totalEdge = 0L;

    public Long getTotalVertex() {
        for (Map.Entry<String, String> entry : vertex.entrySet()) {
            totalVertex = totalVertex + Long.parseLong(entry.getValue());
        }
        return totalVertex;
    }

    public Long getTotalEdge() {
        for (Map.Entry<String, String> entry : edge.entrySet()) {
            totalEdge = totalEdge + Long.parseLong(entry.getValue());
        }
        return totalEdge;
    }
}
