package com.pushi.gv.entity.annotation.validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.pushi.gv.entity.annotation.validator.impl.ValidateBatchDateImpl;

/**
 * 验证批次号格式
 *
 * @author anj
 */
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidateBatchDateImpl.class)
public @interface BatchDate {

    String message() default "批次号格式有误";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}