package com.pushi.gv.entity.vo.cpp.dashboard;

import io.swagger.annotations.ApiModel;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@ApiModel(description = "地图数据展示VO")
public class MapDisplayVO {

    /**
     * 卡数量
     */
    private Long count;

    /**
     * 中文名称
     */
    private String cnName;

    /**
     * 英文名称
     */
    private String enName;

    /**
     * 代码编号
     */
    private String code;
}
