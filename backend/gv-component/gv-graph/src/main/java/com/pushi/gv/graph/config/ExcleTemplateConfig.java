package com.pushi.gv.graph.config;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * excle 配置文件
 *
 * @author anj
 */
@Data
@Component
@ConfigurationProperties(prefix = "excel")
public class ExcleTemplateConfig {

    private String path;

    private String tmpPath;

    private String fileName;
}
