package com.pushi.gv.web.controller.graph.validation;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import javax.validation.constraints.NotNull;

import com.pushi.gv.graph.entity.graph.modify.ModifyType;

@Getter
@Setter
public class ValidModifyTypeVo extends ModifyType {

    @Override
    @NotNull(message = "实体或者关系 id 不能为空")
    @ApiModelProperty(value = "实体或者关系 id", example = "1", required = true)
    public Object getId() {
        return super.getId();
    }

    @Override
    @ApiModelProperty(value = "旧的实体或者关系类型", example = "[\"人\", \"公司\"]")
    public List<String> getOldTypeList() {
        return super.getOldTypeList();
    }

    @Override
    @ApiModelProperty(value = "新的实体或者关系类型", example = "[\"人\", \"公司\"]", required = true)
    public List<String> getNewTypeList() {
        return super.getNewTypeList();
    }

    @Override
    @ApiModelProperty(value = "是否是实体类型", example = "true", required = true)
    public Boolean getVertex() {
        return super.getVertex();
    }
}
