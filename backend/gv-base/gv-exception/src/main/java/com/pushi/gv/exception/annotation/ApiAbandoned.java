package com.pushi.gv.exception.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 弃用接口注解
 * 用于将Web请求映射到放弃到特定处理程序类和/或处理程序方法的媒体类型的注释。
 *
 * @author anj
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiAbandoned {
}