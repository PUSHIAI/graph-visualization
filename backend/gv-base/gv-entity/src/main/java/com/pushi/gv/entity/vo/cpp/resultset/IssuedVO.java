package com.pushi.gv.entity.vo.cpp.resultset;

import java.util.List;

import com.pushi.gv.entity.base.BaseEntityVO;
import com.pushi.gv.entity.vo.cpp.enums.IssuedTypeEnum;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 下发VO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "下发VO")
public class IssuedVO extends BaseEntityVO {

    /**
     * 流程状态Id
     */
    @ApiModelProperty(value = "流程状态Id", example = "56345234432342")
    private Long processId;

    /**
     * 结果集下发类型
     */
    @ApiModelProperty(value = "结果集下发类型", example = "CARD")
    private IssuedTypeEnum type;

    /**
     * 下发名称
     */
    @ApiModelProperty(value = "下发名称", example = "20200512")
    private String name;

    /**
     * 是否全部下发
     */
    @ApiModelProperty(value = "是否全部下发", example = "true")
    private Boolean isAll;

    /**
     * 结果集id集合
     */
    @ApiModelProperty(value = "结果集id集合", example = "123123123,321321321")
    private List<Long> resultSetIds;

    /**
     * 下发路径
     */
    @ApiModelProperty(value = "下发路径", example = "/user/home")
    private String issuedPath;
}
