package com.pushi.gv.entity.annotation.validator.impl;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.pushi.gv.entity.annotation.validator.Mobile;

/**
 * 验证手机号码格式
 *
 * @author anj
 */
public class ValidateMobileImpl implements ConstraintValidator<Mobile, String> {

    //手机号码的正则验证
    private String mobileReg = "^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$";

    private Pattern mobilePattern = Pattern.compile(mobileReg);

    @Override
    public void initialize(Mobile constraintAnnotation) {
    }

    @Override
    public boolean isValid(String mobile, ConstraintValidatorContext context) {
        if (mobile == null) {
            return true;
        } else {
            Matcher matcher = mobilePattern.matcher(mobile);
            return matcher.matches();
        }
    }

}