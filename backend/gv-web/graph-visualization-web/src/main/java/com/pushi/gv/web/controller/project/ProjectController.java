package com.pushi.gv.web.controller.project;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

import java.net.URI;
import java.net.URISyntaxException;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pushi.gv.entity.vo.error.ApiErrorVO;
import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;
import com.pushi.gv.entity.vo.success.ApiSuccessVO;
import com.pushi.gv.web.controller.project.validation.ValidAddProjectVo;
import com.pushi.gv.web.service.project.ProjectService;

/**
 * 项目接口
 *
 * @author sii
 */
@Validated
@RestController
@Api(value = "项目接口", tags = "项目接口")
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
@RequestMapping("/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /**
     * 添加项目
     *
     * @param validAddProjectVo validAddProjectVo类
     * @return ApiSuccessVO
     * @throws URISyntaxException url的语法错误
     */
    @ApiOperation(value = "添加项目")
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<ApiSuccessVO> addProject(@RequestBody @Valid ValidAddProjectVo validAddProjectVo) throws URISyntaxException {
        Long id = this.projectService.save(validAddProjectVo);
        return ResponseEntity.created(new URI("/project/" + id)).build();
    }

    /**
     * 获取分页项目列表
     *
     * @param name 查询名称
     * @return Page<ProjectVo>
     */
    @ApiOperation(value = "获取项目分页列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "currentPage", value = "当前页", example = "0", defaultValue = "0"),
            @ApiImplicitParam(name = "pageSize", value = "当前页面显示条数", example = "10", defaultValue = "10"),
            @ApiImplicitParam(name = "name", value = "查询名称", example = "neo4j")
    })
    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Page<ProjectVo>> projectPageList(@RequestParam(value = "currentPage", required = false, defaultValue = "0") Integer currentPage,
                                                           @RequestParam(value = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                                                           @RequestParam(value = "name", required = false) String name) {
        Page<ProjectVo> projectVoPage = this.projectService.getPage(currentPage, pageSize, name);
        return new ResponseEntity<>(projectVoPage, HttpStatus.OK);
    }

    /**
     * 按照id获取项目详情
     *
     * @param id 项目的id
     * @return ProjectVo
     */
    @ApiOperation(value = "按照id获取项目详情")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<ProjectVo> getProjectById(@PathVariable("id") Long id) {
        ProjectVo projectVo = this.projectService.getByid(id);
        return new ResponseEntity<>(projectVo, HttpStatus.OK);
    }

    /**
     * 修改Project
     *
     * @param id                Project的id
     * @param validAddProjectVo validAddProjectVoVO类
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "按照id修改项目详情")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<ApiSuccessVO> alterProject(@PathVariable("id") Long id, @RequestBody @Valid ValidAddProjectVo validAddProjectVo) {
        this.projectService.update(id, validAddProjectVo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 删除Project
     *
     * @param id Project的id
     * @return ApiSuccessVO
     */
    @ApiOperation(value = "按照id删除项目详情")
    @ApiImplicitParams({@ApiImplicitParam(name = "id", value = "项目id", example = "1343456577432", required = true)})
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<ApiSuccessVO> deletedProject(@PathVariable("id") Long id) {
        this.projectService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
