package com.pushi.gv.web.controller.graph.validation;

import io.swagger.annotations.ApiModelProperty;

import java.util.List;

import com.pushi.gv.graph.entity.graph.query.GraphQuery;

/**
 * 图谱查询类
 *
 * @author anj
 */
public class ValidGetVertexGraphQueryVo extends GraphQuery {

    @Override
    @ApiModelProperty(value = "每页条数", example = "10")
    public Long getPageSize() {
        return super.getPageSize();
    }

    @Override
    @ApiModelProperty(value = "查询的值", example = "哈哈")
    public String getQueryValue() {
        return super.getQueryValue();
    }

    @Override
    @ApiModelProperty(value = "查询属性", example = "name")
    public String getAttributesKey() {
        return super.getAttributesKey();
    }

    @Override
    @ApiModelProperty(value = "是否模糊查询", example = "true")
    public Boolean getFuzzy() {
        return super.getFuzzy();
    }

    @Override
    @ApiModelProperty(value = "实体类型列表", example = "[\"人\", \"公司\"]")
    public List<String> getVertexLabelList() {
        return super.getVertexLabelList();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public List<String> getEdgeTypeList() {
        return super.getEdgeTypeList();
    }

    @Override
    @ApiModelProperty(value = "当前页数", example = "1")
    public Long getCurrentPage() {
        return super.getCurrentPage();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public List<String> getIdList() {
        return super.getIdList();
    }

    @Override
    @ApiModelProperty(hidden = true)
    public Integer getDeep() {
        return super.getDeep();
    }
}
