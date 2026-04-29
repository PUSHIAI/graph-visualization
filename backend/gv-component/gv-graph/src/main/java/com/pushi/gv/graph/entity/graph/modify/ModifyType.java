package com.pushi.gv.graph.entity.graph.modify;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ModifyType {

    /**
     * 实体或关系 id
     */
    private Object id;

    /**
     * 旧的类型列表
     */
    private List<String> oldTypeList;

    /**
     * 新的类型列表
     */
    private List<String> newTypeList;

    /**
     * 是否是实体
     */
    private Boolean vertex;
}
