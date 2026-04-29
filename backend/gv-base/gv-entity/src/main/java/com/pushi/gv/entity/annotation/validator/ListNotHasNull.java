package com.pushi.gv.entity.annotation.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.pushi.gv.entity.annotation.validator.impl.ListNotHasNullValidatorImpl;

/**
 * 自定义注解ListNotHasNull
 * 用于判断List集合中是否含有null元素
 *
 * @author anj
 */
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ListNotHasNullValidatorImpl.class)////此处指定了注解的实现类为ListNotHasNullValidatorImpl

public @interface ListNotHasNull {

    String message() default "List集合中不能含有null元素";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}