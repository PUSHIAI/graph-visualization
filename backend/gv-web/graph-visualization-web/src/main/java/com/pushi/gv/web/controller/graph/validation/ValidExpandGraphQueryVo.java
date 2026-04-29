package com.pushi.gv.web.controller.graph.validation;

import io.swagger.annotations.ApiModelProperty;

import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import com.pushi.gv.graph.entity.graph.query.GraphQuery;

/**
 * 图谱查询类
 *
 * @author anj
 */
public class ValidExpandGraphQueryVo extends GraphQuery {

    @Override
    @ApiModelProperty(hidden = true)
    public Long getPageSize() {
        return super.getPageSize();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public String getQueryValue() {
        return super.getQueryValue();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public String getAttributesKey() {
        return super.getAttributesKey();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public Boolean getFuzzy() {
        return super.getFuzzy();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public List<String> getVertexLabelList() {
        return super.getVertexLabelList();
    }

    @Override
    @ApiModelProperty(value = "关系类型列表", example = "[\"人与公司\", \"人与人\"]")
    public List<String> getEdgeTypeList() {
        return super.getEdgeTypeList();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public Long getCurrentPage() {
        return super.getCurrentPage();
    }

    @Override
    @NotNull(message = "id不能为空")
    @ApiModelProperty(value = "查询的id列表", example = "[\"1\", \"2\"]", required = true)
    public List<String> getIdList() {
        return super.getIdList();
    }

    @Override
    @Min(value = 1, message = "展开深度不能为0以及负数")
    @ApiModelProperty(value = "展开深度", example = "1")
    public Integer getDeep() {
        return super.getDeep();
    }
}
