package com.pushi.gv.entity.vo.cpp.auth;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CGBResourceDTO {

    private Long id;

    private Long createdTime;

    private Long modifiedTime;

    private String createBy;

    private Integer level;

    private String name;

    private String description;

    private String lable;

    private String url;

    private String method;

    private Map<String, CGBActionDTO> actions;

    private List<CGBResourceDTO> child;
}
