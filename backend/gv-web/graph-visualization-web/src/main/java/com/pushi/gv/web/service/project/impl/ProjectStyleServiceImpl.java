package com.pushi.gv.web.service.project.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectStylesVo;
import com.pushi.gv.web.entity.project.Project;
import com.pushi.gv.web.entity.project.ProjectStyle;
import com.pushi.gv.web.repository.ProjectRepository;
import com.pushi.gv.web.repository.ProjectStyleRepository;
import com.pushi.gv.web.service.project.ProjectStyleService;

@Service
@Slf4j
public class ProjectStyleServiceImpl implements ProjectStyleService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectStyleRepository projectStyleRepository;

    /**
     * 保存项目样式
     *
     * @param projectId       项目id
     * @param projectStylesVo 项目样式Vo
     * @return 项目样式id
     * @throws NullPointerException 参数错误 未查询到项目
     */
    @Override
    public Long save(Long projectId, ProjectStylesVo projectStylesVo) throws NullPointerException {
        if (projectId == null || projectStylesVo == null || StringUtils.isBlank(projectStylesVo.getLabelName())) {
            throw new NullPointerException("参数错误");
        }
        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }

        ProjectStyle projectStyle = new ProjectStyle();
        BeanUtil.copyProperties(projectStylesVo, projectStyle, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(ProjectStyle.class));

        if (project.getProjectStyles() != null) {
            project.getProjectStyles().add(projectStyle);
        } else {
            project.setProjectStyles(Collections.singletonList(projectStyle));
        }
        this.projectRepository.save(project);
        return projectStyle.getId();
    }

    /**
     * 更新项目样式
     *
     * @param id              项目样式id
     * @param projectStylesVo 项目样式Vo
     * @return 项目样式id
     * @throws NullPointerException 参数错误 未查询到项目
     */
    @Override
    public Long update(Long id, ProjectStylesVo projectStylesVo) throws NullPointerException {
        if (id == null || projectStylesVo == null || StringUtils.isBlank(projectStylesVo.getLabelName())) {
            throw new NullPointerException("参数错误");
        }
        ProjectStyle projectStyle = this.projectStyleRepository.findById(id).orElse(null);
        if (projectStyle == null) {
            throw new NullPointerException("未查询到项目");
        }

        BeanUtil.copyProperties(projectStylesVo, projectStyle, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(ProjectStyle.class));
        this.projectStyleRepository.save(projectStyle);
        return projectStyle.getId();
    }

    /**
     * 按照项目id获取项目样式列表
     *
     * @param projectId 项目id
     * @return 项目样式列表
     * @throws NullPointerException 参数错误 未查询到项目
     */
    @Override
    public List<ProjectStylesVo> getByprojectId(Long projectId) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }

        List<ProjectStylesVo> projectStylesVoList = new ArrayList<>();
        project.getProjectStyles().forEach(projectStyle -> {
            ProjectStylesVo projectStylesVo = new ProjectStylesVo();
            BeanUtil.copyProperties(projectStyle, projectStylesVo, CopyOptions.create().setIgnoreNullValue(true)
                    .setIgnoreError(false).setEditable(ProjectStylesVo.class));
            projectStylesVoList.add(projectStylesVo);
        });
        return projectStylesVoList;
    }

    /**
     * 删除项目样式id
     *
     * @param id 项目样式id
     * @throws NullPointerException 参数错误
     */
    @Override
    public void deleteById(Long id) {
        if (id == null) {
            throw new NullPointerException("参数错误");
        }

        this.projectStyleRepository.deleteById(id);
    }

    @Override
    public void batchSaveOrUpdate(Long projectId, List<ProjectStylesVo> projectStylesVoList) {
        if (projectId == null || projectStylesVoList == null || projectStylesVoList.isEmpty()) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }

        List<ProjectStyle> projectStyleList = new ArrayList<>();
        if (project.getProjectStyles() == null) {
            projectStylesVoList.forEach(projectStylesVo -> {
                ProjectStyle projectStyle = new ProjectStyle();
                BeanUtil.copyProperties(projectStylesVo, projectStyle, CopyOptions.create().setIgnoreNullValue(true)
                        .setIgnoreError(false).setEditable(ProjectStyle.class));
                projectStyleList.add(projectStyle);
            });
            project.setProjectStyles(projectStyleList);
        } else {
            project.getProjectStyles().forEach(projectStyle -> {
                ProjectStylesVo projectStylesVo = projectStylesVoList.stream().filter(pv ->
                        pv.getLabelName().equals(projectStyle.getLabelName())).findFirst().orElse(null);
                BeanUtil.copyProperties(projectStylesVo, projectStyle, CopyOptions.create().setIgnoreNullValue(true)
                        .setIgnoreError(false).setEditable(ProjectStyle.class));
                projectStylesVoList.remove(projectStylesVo);
            });

            projectStylesVoList.forEach(projectStylesVo -> {
                ProjectStyle projectStyle = new ProjectStyle();
                BeanUtil.copyProperties(projectStylesVo, projectStyle, CopyOptions.create().setIgnoreNullValue(true)
                        .setIgnoreError(false).setEditable(ProjectStyle.class));
                projectStyleList.add(projectStyle);
            });
            project.getProjectStyles().addAll(projectStyleList);
        }

        this.projectRepository.save(project);
    }

    @Override
    public void updatePriority(Long projectId, List<Long> projectStylesIdList) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }

        AtomicInteger priority = new AtomicInteger(1);
        projectStylesIdList.forEach(projectStylesId -> {
            ProjectStyle projectStyle = this.projectStyleRepository.findById(projectStylesId).orElse(null);
            if (projectStyle == null) {
                throw new NullPointerException("未查询到项目");
            }
            projectStyle.setPriority(priority.get());
            this.projectStyleRepository.save(projectStyle);
            priority.getAndIncrement();
        });
    }
}
