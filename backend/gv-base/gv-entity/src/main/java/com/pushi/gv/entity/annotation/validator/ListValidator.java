package com.pushi.gv.entity.annotation.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.pushi.gv.entity.annotation.validator.impl.ListValidatorImpl;

/**
 * 自定义注解ListNotHasNull 的实现类
 * 用于判断List集合中是否含有null元素
 *
 * @author anj
 */
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ListValidatorImpl.class)
public @interface ListValidator {

    String[] fieldNames() default {};

    String[] messages() default {};

    String message() default "注解参数错误";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}