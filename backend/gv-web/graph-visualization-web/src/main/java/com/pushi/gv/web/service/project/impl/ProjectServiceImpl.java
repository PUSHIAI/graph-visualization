package com.pushi.gv.web.service.project.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.criteria.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;
import com.pushi.gv.exception.exceptions.ViolationException;
import com.pushi.gv.web.entity.project.Project;
import com.pushi.gv.web.repository.ProjectRepository;
import com.pushi.gv.web.service.project.ProjectService;

@Service
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    /**
     * 保存项目
     *
     * @param projectVo 项目VO实体
     * @return 项目id
     * @throws NullPointerException 参数错误
     * @throws ViolationException   项目名已存在
     */
    @Override
    @Transactional
    public Long save(ProjectVo projectVo) {
        if (projectVo == null || StringUtils.isBlank(projectVo.getName()) || StringUtils.isBlank(projectVo.getGraphType())
                || (projectVo.getJanusConnect() == null && projectVo.getNeo4jConnect() == null)) {
            throw new NullPointerException("参数错误");
        }

        Project project = new Project();
        project.setName(projectVo.getName());
        if (this.projectRepository.exists(Example.of(project))) {
            throw new ViolationException(projectVo.getName() + " 项目名已存在");
        }

        BeanUtil.copyProperties(projectVo, project, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(Project.class));
        this.projectRepository.save(project);
        return project.getId();
    }

    /**
     * 根据id更新项目
     *
     * @param id        项目id
     * @param projectVo 项目
     * @return 项目id
     * @throws NullPointerException 参数错误
     * @throws NullPointerException 未查询到项目
     * @throws ViolationException   项目名已存在
     */
    @Override
    @Transactional
    public Long update(Long id, ProjectVo projectVo) {
        if (id == null || projectVo == null || StringUtils.isBlank(projectVo.getName())
                || StringUtils.isBlank(projectVo.getGraphType())) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(id).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }

        Specification<Project> specification = (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.notEqual(root.get("id"), id));
            predicates.add(criteriaBuilder.equal(root.get("name"), projectVo.getName()));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        if (this.projectRepository.count(specification) >= 1) {
            throw new ViolationException(projectVo.getName() + " 项目名已存在");
        }

        BeanUtil.copyProperties(projectVo, project, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(Project.class));

        project.getProjectStyles().clear();
        this.projectRepository.save(project);
        return project.getId();
    }

    /**
     * 按照id获取项目
     *
     * @param projectId 项目id
     * @return 项目实体 {@link com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo}
     * @throws NullPointerException 参数错误 该项目不存在
     */
    @Override
    public ProjectVo getByid(Long projectId) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("该项目不存在");
        }

        ProjectVo projectVo = new ProjectVo();
        BeanUtil.copyProperties(project, projectVo, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(ProjectVo.class));
        return projectVo;
    }

    /**
     * 获取项目分页列表
     *
     * @param currentPage 当前页
     * @param pageSize    每页条数
     * @param name        名称
     * @return 项目分页列表 {@link com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo}
     */
    @Override
    public Page<ProjectVo> getPage(Integer currentPage, Integer pageSize, String name) {
        if (currentPage == null) {
            currentPage = 0;
        }

        if (pageSize == null) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(currentPage, pageSize);

        Page<Project> projectPage;
        if (StringUtils.isBlank(name)) {
            projectPage = this.projectRepository.findAll(pageable);
        } else {
            Project project = new Project();
            project.setName(name);
            projectPage = this.projectRepository.findAll(Example.of(project, ExampleMatcher.matching()
                    .withMatcher("name", ExampleMatcher.GenericPropertyMatcher::contains)), pageable);
        }

        List<ProjectVo> projectVoList = new ArrayList<>();
        projectPage.getContent().forEach(project -> {
            ProjectVo projectVo = new ProjectVo();
            BeanUtil.copyProperties(project, projectVo, CopyOptions.create().setIgnoreNullValue(true)
                    .setIgnoreError(false).setIgnoreProperties("neo4jConnect", "janusConnect", "projectStyles").setEditable(ProjectVo.class));
            projectVoList.add(projectVo);
        });

        return new PageImpl<>(projectVoList, pageable, projectPage.getTotalElements());
    }

    /**
     * 根据id删除项目
     *
     * @param projectId 项目id
     * @throws NullPointerException 参数错误
     */
    @Override
    @Transactional
    public void deleteById(Long projectId) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        this.projectRepository.deleteById(projectId);
    }
}
