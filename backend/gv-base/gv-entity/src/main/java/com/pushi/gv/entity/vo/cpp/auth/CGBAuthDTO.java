package com.pushi.gv.entity.vo.cpp.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CGBAuthDTO {

    private String sign;

    private String address;

    private String loginType;

    private Long ts;
}