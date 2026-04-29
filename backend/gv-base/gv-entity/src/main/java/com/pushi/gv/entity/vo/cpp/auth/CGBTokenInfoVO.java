package com.pushi.gv.entity.vo.cpp.auth;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * TokenVO
 *
 * @author anj
 */
@Getter
@Setter
@ApiModel(description = "TokenVO")
public class CGBTokenInfoVO {

    /**
     * 超时时间
     */
    @ApiModelProperty(value = "超时时间", example = "1590053457000")
    private Long expire;

    /**
     * 搬迁
     */
    @ApiModelProperty(hidden = true)
    private String relocation;

    /**
     * tokenCGB
     */
    @ApiModelProperty(hidden = true)
    private String secretToken;

    /**
     * 时间戳
     */
    @ApiModelProperty(hidden = true)
    private Long timestamp;

    /**
     * token
     */
    @ApiModelProperty(hidden = true)
    private String token;

    /**
     * token
     */
    @ApiModelProperty(value = "token", example = "Bearer d019b5af4524870b460056e21dda0a6b146d3dc76a2")
    private String accessToken;
}
