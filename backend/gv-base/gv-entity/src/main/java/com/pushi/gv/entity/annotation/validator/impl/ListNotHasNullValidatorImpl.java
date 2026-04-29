package com.pushi.gv.entity.annotation.validator.impl;

import java.util.List;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.pushi.gv.entity.annotation.validator.ListNotHasNull;

/**
 * 自定义注解ListNotHasNull 的实现类
 * 用于判断List集合中是否含有null元素
 *
 * @author anj
 */
public class ListNotHasNullValidatorImpl implements ConstraintValidator<ListNotHasNull, List> {

    @Override
    public void initialize(ListNotHasNull constraintAnnotation) {
    }

    @Override
    public boolean isValid(List list, ConstraintValidatorContext constraintValidatorContext) {
        if (list == null || list.size() == 0) {
            return false;
        }

        for (Object object : list) {
            if (object == null) {
                return false;
            }
        }
        return true;
    }
}