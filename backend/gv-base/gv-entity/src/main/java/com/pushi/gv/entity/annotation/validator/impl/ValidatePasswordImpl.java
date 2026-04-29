package com.pushi.gv.entity.annotation.validator.impl;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.pushi.gv.entity.annotation.validator.Password;

/**
 * 验证密码格式
 *
 * @author anj
 */
public class ValidatePasswordImpl implements ConstraintValidator<Password, String> {

    private String passwordReg = "^[a-zA-Z0-9-_!@#$%^&*=+]+$";

    private Pattern passwordPattern = Pattern.compile(passwordReg);

    @Override
    public void initialize(Password password) {

    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true;
        } else {
            Matcher matcher = passwordPattern.matcher(password);
            return matcher.matches();
        }
    }
}