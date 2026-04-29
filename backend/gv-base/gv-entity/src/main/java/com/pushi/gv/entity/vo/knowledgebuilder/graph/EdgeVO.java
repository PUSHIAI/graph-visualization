package com.pushi.gv.entity.vo.knowledgebuilder.graph;

import java.time.LocalDateTime;
import java.util.Map;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 边类
 *
 * @author anj
 */
@Data
@ApiModel(description = "关系实体")
public class EdgeVO {

    @ApiModelProperty(value = "关系id", example = "4344456577432")
    private String id;

    @ApiModelProperty(value = "关系名称", example = "这是一个关系")
    private String name;

    @ApiModelProperty(value = "关系类型")
    private String type;

    @ApiModelProperty(value = "起始点id", example = "14344456577432")
    private String source;

    @ApiModelProperty(value = "结束点id", example = "34344456577432")
    private String target;

    @ApiModelProperty(value = "起始时间")
    private LocalDateTime startTime;

    @ApiModelProperty(value = "结束时间")
    private LocalDateTime endTime;

    @ApiModelProperty(value = "属性")
    private Map<String, Object> attributes;

    public static EdgeVO of(String source, String target, String type){
        EdgeVO edgeVO = new EdgeVO();
        edgeVO.setSource(source);
        edgeVO.setTarget(target);
        edgeVO.setType(type);
        return edgeVO;
    }
}
