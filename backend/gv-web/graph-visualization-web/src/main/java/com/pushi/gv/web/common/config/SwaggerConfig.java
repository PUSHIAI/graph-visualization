package com.pushi.gv.web.common.config;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * cpp参数配置
 *
 * @author anj
 */
@Data
@Component
@ConfigurationProperties(prefix = "swagger")
public class SwaggerConfig {

    /**
     * swagger请求host
     */
    private String host;

    /**
     * swagger统一前缀
     */
    private String swagerPrefixPath;
}
