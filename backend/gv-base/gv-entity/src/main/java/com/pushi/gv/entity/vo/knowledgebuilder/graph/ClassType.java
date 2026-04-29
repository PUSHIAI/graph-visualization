package com.pushi.gv.entity.vo.knowledgebuilder.graph;

/**
 * 概念类型
 *
 * @author anj
 */
public enum ClassType {

    /**
     * 实体
     * 概念中的物件类抽象定义
     */
    ENTITY,

    /**
     * 事件
     * 概念中的描述事情类抽象定义，具有发生时间属性。有一定的关系表达能力（主要发生者和被影响者）
     */
    EVENT,

    /**
     * 文档
     * 概念中暂时无法归类的描述，在经过一定处理（NLP等）后，产生的实体会关联到原文档，文档一般不进行推理分析
     */
    DOCUMENT
}
