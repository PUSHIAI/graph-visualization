package com.pushi.gv.exception.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 版本号注解
 * 用于将Web请求映射到放弃到特定处理程序类和/或处理程序方法的媒体类型的注释。
 *
 * @author anj
 * @since 1.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Repeatable(ApiVersions.class)
public @interface ApiVersion {

    /**
     * 大版本号
     *
     * @return 大版本号
     */
    int major() default -1;

    /**
     * 小版本号
     *
     * @return 小版本号
     */
    int minor() default -1;

    /**
     * 复合版本号
     *
     * @return 复合版本号
     */
    String value() default "";
}
