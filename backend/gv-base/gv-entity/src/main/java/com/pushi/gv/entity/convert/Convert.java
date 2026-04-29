package com.pushi.gv.entity.convert;

import com.alibaba.fastjson.JSON;

/**
 * @author anj
 */
public abstract class Convert {

    /**
     * 转换对象
     *
     * @param targetClass 目标对象类
     * @return
     */
    public final Convert convert(Class<? extends Convert> targetClass) {
        JSON json = (JSON) JSON.toJSON(this);
        return JSON.toJavaObject(json, targetClass);
    }
}
