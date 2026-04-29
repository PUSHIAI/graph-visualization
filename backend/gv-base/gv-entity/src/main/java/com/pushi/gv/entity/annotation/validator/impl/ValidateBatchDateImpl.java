package com.pushi.gv.entity.annotation.validator.impl;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.pushi.gv.entity.annotation.validator.BatchDate;

/**
 * 验证批次号格式
 *
 * @author anj
 */
public class ValidateBatchDateImpl implements ConstraintValidator<BatchDate, String> {

    private String batchDateReg = "([\\d]{4}(((0[13578]|1[02])((0[1-9])|([12][0-9])|(3[01])))|(((0[469])|11)((0[1-9])|([12][0-9])|30))|(02((0[1-9])|(1[0-9])|(2[0-8])))))|((((([02468][048])|([13579][26]))00)|([0-9]{2}(([02468][048])|([13579][26]))))(((0[13578]|1[02])((0[1-9])|([12][0-9])|(3[01])))|(((0[469])|11)((0[1-9])|([12][0-9])|30))|(02((0[1-9])|(1[0-9])|(2[0-9])))))";

    private Pattern batchDatePattern = Pattern.compile(batchDateReg);

    @Override
    public void initialize(BatchDate batchDate) {

    }

    @Override
    public boolean isValid(String batchDate, ConstraintValidatorContext context) {
        if (batchDate == null) {
            return false;
        } else {
            Matcher matcher = batchDatePattern.matcher(batchDate);
            return matcher.matches();
        }
    }
}