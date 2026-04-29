package com.pushi.gv.web.service.project;

import java.util.List;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectStylesVo;

/**
 * 项目Sku接口
 *
 * @author sii
 */
public interface ProjectStyleService {

    /**
     * 保存项目样式
     *
     * @param projectId       项目id
     * @param projectStylesVo 项目样式Vo
     * @return 项目样式id
     * @throws NullPointerException 参数错误 未查询到项目
     */
    Long save(Long projectId, ProjectStylesVo projectStylesVo);

    /**
     * 更新项目样式
     *
     * @param id              项目样式id
     * @param projectStylesVo 项目样式Vo
     * @return 项目样式id
     * @throws NullPointerException 参数错误 未查询到项目
     */
    Long update(Long id, ProjectStylesVo projectStylesVo);

    /**
     * 按照项目id获取项目样式列表
     *
     * @param projectId 项目id
     * @return 项目样式列表
     * @throws NullPointerException 参数错误 未查询到项目
     */
    List<ProjectStylesVo> getByprojectId(Long projectId);

    /**
     * 删除项目样式id
     *
     * @param id 项目样式id
     * @throws NullPointerException 参数错误
     */
    void deleteById(Long id);

    /**
     * 批量保存或更新
     *
     * @param projectId           项目id
     * @param projectStylesVoList 项目样式列表
     */
    void batchSaveOrUpdate(Long projectId, List<ProjectStylesVo> projectStylesVoList);


    /**
     * 更新排序
     *
     * @param projectId           项目id
     * @param projectStylesIdList 项目样式id列表
     */
    void updatePriority(Long projectId, List<Long> projectStylesIdList);
}
