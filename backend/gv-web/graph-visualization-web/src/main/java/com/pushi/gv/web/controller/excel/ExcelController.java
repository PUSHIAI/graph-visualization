package com.pushi.gv.web.controller.excel;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pushi.gv.entity.vo.error.ApiErrorVO;
import com.pushi.gv.web.service.excel.AddExcelDataService;

/**
 * Excel接口
 *
 * @author sii
 */
@Validated
@RestController
@Api(value = "Excel接口", tags = "Excel接口")
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
@RequestMapping("/excel")
public class ExcelController {

    @Autowired
    private AddExcelDataService addExcelDataService;

    /**
     * 下载添加数据Excel模版
     *
     * @param response 响应
     */
    @ApiOperation(value = "下载添加数据Excel模版")
    @RequestMapping(value = "", method = {RequestMethod.GET, RequestMethod.POST}, produces = "application/octet-stream")
    public void projectPageList(HttpServletResponse response) {
        this.addExcelDataService.exportAddExcelData(response);
    }

    /**
     * 上传Excel添加数据
     *
     * @param projectId 项目id
     * @param excelFile excel文件
     */
    @ApiOperation(value = "上传Excel添加数据")

    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true),
            @ApiImplicitParam(name = "excelFile", value = "excel文件", required = true)
    })
    @RequestMapping(value = "/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<Boolean> projectPageList(@PathVariable("projectId") Long projectId, @RequestParam("excelFile") MultipartFile excelFile) {
        this.addExcelDataService.addExcelData(projectId, excelFile);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
