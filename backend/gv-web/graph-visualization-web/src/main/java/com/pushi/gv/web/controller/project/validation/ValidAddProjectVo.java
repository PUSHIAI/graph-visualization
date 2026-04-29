package com.pushi.gv.web.controller.project.validation;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;

/**
 * 用户VO校验类
 *
 * @author anj
 */
public class ValidAddProjectVo extends ProjectVo {

    @Override
    @NotNull(message = "项目名称不能为空")
    @Size(min = 1, max = 30, message = "项目名称输入范围为1～30个字符")
    public String getName() {
        return super.getName();
    }

    @Override
    @NotNull(message = "图谱类型不能为空")
    public String getGraphType() {
        return super.getGraphType();
    }
}
