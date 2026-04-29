package com.pushi.gv.web.controller.project;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.pushi.gv.entity.vo.error.ApiErrorVO;
import com.pushi.gv.entity.vo.graphvisualization.project.ProjectStylesVo;
import com.pushi.gv.entity.vo.success.ApiSuccessVO;
import com.pushi.gv.web.controller.project.validation.ValidAddProjectStyleVo;
import com.pushi.gv.web.service.project.ProjectStyleService;

/**
 * 项目样式接口
 *
 * @author sii
 */
@Validated
@RestController
@Api(value = "项目样式接口", tags = "项目样式接口")
@ApiResponses({
        @ApiResponse(code = 400, message = "参数错误", response = ApiErrorVO.class),
        @ApiResponse(code = 403, message = "接口版本号不对", response = ApiErrorVO.class),
        @ApiResponse(code = 404, message = "当前请求路径不正确｜未获取到实体", response = ApiErrorVO.class),
        @ApiResponse(code = 405, message = "请求方法错误", response = ApiErrorVO.class),
        @ApiResponse(code = 409, message = "违规操作", response = ApiErrorVO.class),
        @ApiResponse(code = 410, message = "接口已废除", response = ApiErrorVO.class),
        @ApiResponse(code = 415, message = "请求媒体类型错误", response = ApiErrorVO.class),
        @ApiResponse(code = 415, message = "请求媒体类型错误", response = ApiErrorVO.class),
        @ApiResponse(code = 422, message = "违规异常", response = ApiErrorVO.class),
        @ApiResponse(code = 500, message = "服务器内部错误", response = ApiErrorVO.class)
})
@RequestMapping("project/{projectId}/projectStyle")
public class ProjectStyleController {

    @Autowired
    private ProjectStyleService projectStyleService;

    /**
     * 添加项目样式
     *
     * @param projectId       项目id
     * @param projectStylesVo 项目样式Vo
     * @return 项目样式id
     * @throws URISyntaxException
     */
    @ApiOperation(value = "添加项目样式")
    @ApiImplicitParams({@ApiImplicitParam(name = "projectId", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<ApiSuccessVO> addProject(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidAddProjectStyleVo projectStylesVo) throws URISyntaxException {
        Long id = this.projectStyleService.save(projectId, projectStylesVo);
        return ResponseEntity.created(new URI("/projectStyle/" + id)).build();
    }

    /**
     * 获取项目样式列表
     *
     * @param projectId 项目id
     * @return 项目样式列表
     */
    @ApiOperation(value = "获取项目样式列表")
    @ApiImplicitParams({@ApiImplicitParam(name = "projectId", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<ProjectStylesVo>> projectPageList(@PathVariable("projectId") Long projectId) {
        List<ProjectStylesVo> projectStylesVoList = this.projectStyleService.getByprojectId(projectId);
        return new ResponseEntity<>(projectStylesVoList, HttpStatus.OK);
    }

    /**
     * 按照id修改项目样式详情
     *
     * @param id              项目样式id
     * @param projectStylesVo 项目样式Vo
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "按照id修改项目样式详情")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "项目样式id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<ApiSuccessVO> alterProject(@PathVariable("id") Long id, @RequestBody @Valid ValidAddProjectStyleVo projectStylesVo) {
        this.projectStyleService.update(id, projectStylesVo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 按照id删除项目详情
     *
     * @param id 项目样式id
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "按照id删除项目详情")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "项目样式id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<ApiSuccessVO> deletedProject(@PathVariable("id") Long id) {
        this.projectStyleService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 批量保存或更新
     *
     * @param projectId 项目id
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "批量保存或更新")
    @ApiImplicitParams({@ApiImplicitParam(name = "projectId", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/batch", method = RequestMethod.POST)
    public ResponseEntity<ApiSuccessVO> batchSaveOrUpdate(@PathVariable("projectId") Long projectId,
                                                          @RequestBody List<ProjectStylesVo> projectStylesVoList) {
        this.projectStyleService.batchSaveOrUpdate(projectId, projectStylesVoList);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 更新排序
     *
     * @param projectId 项目id
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "更新排序")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1343456577432", required = true),
            @ApiImplicitParam(name = "projectStylesIdList", value = "项目样式id列表", example = "[1, 2, 3]", required = true),})
    @RequestMapping(value = "/updatePriorityList", method = RequestMethod.POST)
    public ResponseEntity<ApiSuccessVO> updatePriority(@PathVariable("projectId") Long projectId,
                                                       @RequestBody List<Long> projectStylesIdList) {
        this.projectStyleService.updatePriority(projectId, projectStylesIdList);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
