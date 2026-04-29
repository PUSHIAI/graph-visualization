package com.pushi.gv.entity.vo.cpp.knowledgebuilder;

import java.util.List;

import io.swagger.annotations.ApiModel;
import lombok.Getter;
import lombok.Setter;

/**
 * 查询可疑信息VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "查询可疑信息VO")
public class SuspiciousInfoVO {

    /**
     * 类型
     */
    private String type;

    /**
     * 唯一标识
     */
    private List<String> uniquelyIdentifieList;
}
