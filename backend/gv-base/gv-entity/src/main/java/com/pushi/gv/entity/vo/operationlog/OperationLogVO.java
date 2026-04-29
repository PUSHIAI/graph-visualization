package com.pushi.gv.entity.vo.operationlog;

import java.util.Date;

import com.pushi.gv.entity.base.BaseEntityVO;

import lombok.Getter;
import lombok.Setter;

/**
 * OperationLogVO类
 *
 * @author liuwei
 */
@Setter
@Getter
public class OperationLogVO extends BaseEntityVO {

    private static final long serialVersionUID = -382957211343741494L;

    /**
     * 操作时间
     */
    private Date operationTime;

    /**
     * 执行时间
     */
    private Long runTime;

    /**
     * 操作人id
     */
    private String operationId;

    /**
     * 操作人
     */
    private String operation;

    /**
     * ip地址
     */
    private String ip;

    /**
     * 请求url
     */
    private String url;

    /**
     * 请求方式
     */
    private String requestMethod;

    /**
     * 业务，参考对应系统业务枚举
     */
    private String professionalWork;

    /**
     * 业务id
     */
    private Long professionalWorkId;

    /**
     * 操作参数
     */
    private String parameter;

    /**
     * 操作内容
     */
    private String details;

    /**
     * 返回数据
     */
    private String returnData;

    /**
     * 异常信息
     */
    private String exception;
}
