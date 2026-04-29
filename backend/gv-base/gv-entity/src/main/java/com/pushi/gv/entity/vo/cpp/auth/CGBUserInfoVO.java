package com.pushi.gv.entity.vo.cpp.auth;

import java.util.List;

import lombok.Data;

@Data
public class CGBUserInfoVO {

    private Long id;

    private String username;

    private String nickName;

    private String email;

    private String orgName;

    private String domanType;

    private String mobile;

    private String authorities;

    private List<Integer> teamIds;
}
