package com.pushi.gv.entity.annotation.validator.impl;

import java.util.List;
import java.util.Map;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.pushi.gv.entity.annotation.validator.ListValidator;

import cn.hutool.core.bean.BeanUtil;

/**
 * 自定义注解ListNotHasNull 的实现类
 * 用于判断List集合中是否含有null元素
 *
 * @author anj
 */
public class ListValidatorImpl implements ConstraintValidator<ListValidator, List> {

    private String[] fieldNames;

    private String[] messages;

    @Override
    public void initialize(ListValidator constraintAnnotation) {
        this.fieldNames = constraintAnnotation.fieldNames();
        this.messages = constraintAnnotation.messages();
    }

    @Override
    public boolean isValid(List list, ConstraintValidatorContext context) {
        if (fieldNames.length == 0) {
            return false;
        }
        if (messages.length == 0) {
            return false;
        }
        for (Object object : list) {
            if (object == null) {
                return false;
            }
            Map<String, Object> map = BeanUtil.beanToMap(object);
            for (int i = 0; i < fieldNames.length; i++) {
                if (map.get(fieldNames[i]) == null || "".equals(map.get(fieldNames[i]))) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(fieldNames[i] + ":" + messages[i])
                            .addContainerElementNode(fieldNames[i], object.getClass(), i)
                            .addConstraintViolation();
                    return false;
                }
            }
        }
        return true;
    }
}