package com.pushi.gv.web.controller.graph.validation;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import javax.validation.constraints.NotNull;

import com.pushi.gv.graph.entity.graph.add.AddAttributeModel;
import com.pushi.gv.graph.entity.graph.modify.ModifyAttribute;

@Getter
@Setter
public class ValidModifyAttributeVo extends ModifyAttribute {

    @Override
    @NotNull(message = "实体或者关系 id 不能为空")
    @ApiModelProperty(value = "实体或者关系 id", example = "1", required = true)
    public Object getId() {
        return super.getId();
    }

    @Override
    @ApiModelProperty(value = "实体或者关系属性列表", example = "{\"name\": \"哈哈\"}", required = true)
    public List<AddAttributeModel> getAttributeModelList() {
        return super.getAttributeModelList();
    }

    @Override
    @ApiModelProperty(value = "是否是实体类型", example = "true", required = true)
    public Boolean getVertex() {
        return super.getVertex();
    }
}
