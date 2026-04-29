package com.pushi.gv.entity.vo.success;

import java.util.Collections;
import java.util.List;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 通用成功信息.
 *
 * @author anj
 */
@ApiModel(description = "通用成功信息")
public class ApiSuccessVO {

    @ApiModelProperty(value = "状态响应码", example = "200")
    private int status;

    @ApiModelProperty(value = "内容")
    private Object data;

    @ApiModelProperty(value = "消息", example = "这是个萌萌哒的消息")
    private String message;

    @ApiModelProperty(value = "错误详情列表")
    private List<String> errors;

    @ApiModelProperty(value = "错误类型名称")
    private String exceptionName;

    public ApiSuccessVO(Object data) {
        super();
        this.status = 200;
        this.data = data;
        this.message = "success";
    }

    public ApiSuccessVO(int statusCode, String message) {
        super();
        this.status = statusCode;
        this.message = message;
    }

    public ApiSuccessVO(int statusCode, String message, Object data) {
        super();
        this.status = statusCode;
        this.data = data;
        this.message = message;
    }

    public ApiSuccessVO(final int status, Object data, final String message, final List<String> errors, final String exceptionName) {
        super();
        this.status = status;
        this.data = data;
        this.message = message;
        this.errors = errors;
        this.exceptionName = exceptionName;
    }

    public ApiSuccessVO(final int status, Object data, final String message, final String error, final String exceptionName) {
        super();
        this.status = status;
        this.data = data;
        this.message = message;
        errors = Collections.singletonList(error);
        this.exceptionName = exceptionName;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(final int status) {
        this.status = status;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(final String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(final List<String> errors) {
        this.errors = errors;
    }

    public void setError(final String error) {
        errors = Collections.singletonList(error);
    }

    public String getExceptionName() {
        return exceptionName;
    }

    public void setExceptionName(String exceptionName) {
        this.exceptionName = exceptionName;
    }
}
