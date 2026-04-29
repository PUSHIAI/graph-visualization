package com.pushi.gv.web.controller.project.validation;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectStylesVo;

/**
 * 项目样式Vo校验类
 *
 * @author anj
 */
public class ValidAddProjectStyleVo extends ProjectStylesVo {

    @Override
    @NotNull(message = "类型名称不能为空")
    public String getLabelName() {
        return super.getLabelName();
    }

    @Override
    @Min(value = 1, message = "优先级不能为0以及负数")
    public Integer getPriority() {
        return super.getPriority();
    }
}
