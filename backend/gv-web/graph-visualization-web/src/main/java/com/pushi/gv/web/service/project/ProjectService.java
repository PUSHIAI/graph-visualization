package com.pushi.gv.web.service.project;

import org.springframework.data.domain.Page;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;
import com.pushi.gv.exception.exceptions.ViolationException;

/**
 * 项目接口
 *
 * @author sii
 */
public interface ProjectService {

    /**
     * 保存项目
     *
     * @param projectVo 项目VO实体
     * @throws NullPointerException 参数错误
     * @throws ViolationException   项目名已存在
     */
    Long save(ProjectVo projectVo) throws NullPointerException, ViolationException;

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
    Long update(Long id, ProjectVo projectVo);

    /**
     * 按照id获取项目
     *
     * @param projectId 项目id
     * @return 项目实体 {@link com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo}
     * @throws NullPointerException 参数错误 该项目不存在
     */
    ProjectVo getByid(Long projectId) throws NullPointerException;

    /**
     * 获取项目分页列表
     *
     * @param currentPage 当前页
     * @param pageSize    每页条数
     * @param name        名称
     * @return 项目分页列表 {@link com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo}
     */
    Page<ProjectVo> getPage(Integer currentPage, Integer pageSize, String name);

    /**
     * 根据id删除项目
     *
     * @param projectId 项目id
     * @throws NullPointerException 参数错误
     */
    void deleteById(Long projectId) throws NullPointerException;
}
