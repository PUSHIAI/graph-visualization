package com.pushi.gv.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 图展示WEB应用
 *
 * @author sii
 */
@SpringBootApplication
@ComponentScan("com.pushi.gv")
@EnableJpaAuditing
public class GraphVisualizationWebApplication {
    public static void main(String[] args) {
        SpringApplication.run(GraphVisualizationWebApplication.class, args);
    }
}
