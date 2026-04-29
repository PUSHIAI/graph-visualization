package com.pushi.gv.entity.vo.error;

import java.util.Collections;
import java.util.List;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 通用系统错误信息.
 *
 * @author anj
 */
@ApiModel(description = "通用系统错误信息")
public class ApiErrorVO {

    @ApiModelProperty(value = "状态响应码", example = "500")
    private int status;

    @ApiModelProperty(value = "内容")
    private Object data;

    @ApiModelProperty(value = "消息", example = "这是个恶意的消息")
    private String message;

    @ApiModelProperty(value = "错误详情列表")
    private List<String> errors;

    @ApiModelProperty(value = "错误类型名称")
    private String exceptionName;

    public ApiErrorVO() {
        super();
    }

    public ApiErrorVO(final int status, final String message, final List<String> errors, final String exceptionName) {
        super();
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.exceptionName = exceptionName;
    }

    public ApiErrorVO(final int status, final String message, final String error, final String exceptionName) {
        super();
        this.status = status;
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
