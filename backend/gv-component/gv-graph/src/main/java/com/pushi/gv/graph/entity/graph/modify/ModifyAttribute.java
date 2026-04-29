package com.pushi.gv.graph.entity.graph.modify;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

import com.pushi.gv.graph.entity.graph.add.AddAttributeModel;

@Getter
@Setter
public class ModifyAttribute {

    /**
     * 实体或者关系 id
     */
    private Object id;

    /**
     * 关系列表
     */
    private List<AddAttributeModel> attributeModelList;

    /**
     * 是否是实体
     */
    private Boolean vertex;
}
