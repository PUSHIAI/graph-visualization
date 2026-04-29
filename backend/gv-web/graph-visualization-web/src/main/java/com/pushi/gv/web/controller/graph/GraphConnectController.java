package com.pushi.gv.web.controller.graph;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

import java.util.List;

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
import com.pushi.gv.web.controller.graph.validation.ValidExistGraphQueryVo;
import com.pushi.gv.web.controller.graph.validation.ValidExpandGraphQueryVo;
import com.pushi.gv.web.controller.graph.validation.ValidGetVertexGraphQueryVo;
import com.pushi.gv.web.controller.graph.validation.ValidModifyAttributeVo;
import com.pushi.gv.web.controller.graph.validation.ValidModifyTypeVo;
import com.pushi.gv.web.controller.graph.validation.ValidShortGraphQueryVo;
import com.pushi.gv.web.service.graphconnect.GraphConnectService;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.graph.EdgeModel;
import com.pushi.gv.graph.entity.graph.ExistModel;
import com.pushi.gv.graph.entity.graph.GraphModel;
import com.pushi.gv.graph.entity.graph.SchemaModel;
import com.pushi.gv.graph.entity.graph.VertexModel;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;

/**
 * 图谱查询接口
 *
 * @author sii
 */
@Validated
@RestController
@Api(value = "图谱查询接口", tags = "图谱查询接口")
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
@RequestMapping("/graph")
public class GraphConnectController {

    @Autowired
    private GraphConnectService graphConnectService;

    /**
     * 按照项目id获取图连接信息
     *
     * @param projectId 项目id
     * @return 图连接信息
     */
    @ApiOperation(value = "按照项目id获取图连接信息")
    @ApiImplicitParams({@ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)})
    @RequestMapping(value = "/{projectId}", method = RequestMethod.GET)
    public ResponseEntity<GraphConnectInfo> getProjectById(@PathVariable("projectId") Long projectId) {
        GraphConnectInfo graphConnectInfo = this.graphConnectService.getGraphByProjectId(projectId);
        return new ResponseEntity<>(graphConnectInfo, HttpStatus.OK);
    }

    /**
     * 测试图谱连接
     *
     * @param projectVo 项目
     * @return 是否能够连接
     */
    @ApiOperation(value = "测试图谱连接")
    @RequestMapping(value = "/test", method = RequestMethod.POST)
    public ResponseEntity<Boolean> testConnect(@RequestBody ProjectVo projectVo) {
        this.graphConnectService.testConnect(projectVo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 获取图谱中的 Schema（实体类型，边的类型）
     *
     * @param projectId 项目id
     * @return Schema
     */
    @ApiOperation(value = "获取图谱中的 Schema")
    @ApiImplicitParams({@ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)})
    @RequestMapping(value = "/schema/{projectId}", method = RequestMethod.GET)
    public ResponseEntity<SchemaModel> getSchema(@PathVariable("projectId") Long projectId) {
        SchemaModel schemaModel = this.graphConnectService.getSchema(projectId);
        return new ResponseEntity<>(schemaModel, HttpStatus.OK);
    }

    /**
     * 获取图谱所有属性
     *
     * @param projectId 项目id
     * @return 属性列表
     */
    @ApiOperation(value = "获取图谱所有属性")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/attributes/{projectId}", method = RequestMethod.GET)
    public ResponseEntity<List<String>> getAllAttributesName(@PathVariable("projectId") Long projectId) {
        List<String> attributesNameList = this.graphConnectService.getAllAttributesName(projectId);
        return new ResponseEntity<>(attributesNameList, HttpStatus.OK);
    }

    /**
     * 查询实体列表
     *
     * @param projectId  项目id
     * @param graphQuery 查询类
     * @return 实体列表
     */
    @ApiOperation(value = "查询实体列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/vertex/{projectId}/list", method = RequestMethod.POST)
    public ResponseEntity<List<VertexModel>> getVertexList(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidGetVertexGraphQueryVo graphQuery) {
        List<VertexModel> vertexModelList = this.graphConnectService.getVertexList(projectId, graphQuery);
        return new ResponseEntity<>(vertexModelList, HttpStatus.OK);
    }

    /**
     * 查询实体分页列表
     *
     * @param projectId  项目id
     * @param graphQuery 查询类
     * @return 实体分页列表
     */
    @ApiOperation(value = "查询实体分页列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/vertex/{projectId}/page", method = RequestMethod.POST)
    public ResponseEntity<Page<VertexModel>> getVertexPage(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidGetVertexGraphQueryVo graphQuery) {
        Page<VertexModel> vertexModelPage = this.graphConnectService.getVertexPage(projectId, graphQuery);
        return new ResponseEntity<>(vertexModelPage, HttpStatus.OK);
    }

    /**
     * 实体展开
     *
     * @param projectId  项目id
     * @param graphQuery 查询类
     * @return 图列表
     */
    @ApiOperation(value = "实体展开")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/expand/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<GraphModel> expand(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidExpandGraphQueryVo graphQuery) {
        GraphModel graphModel = this.graphConnectService.expand(projectId, graphQuery);
        return new ResponseEntity<>(graphModel, HttpStatus.OK);
    }

    /**
     * 查询点的id是否存在图谱总
     *
     * @param projectId  项目id
     * @param graphQuery 查询类
     * @return 图列表
     */
    @ApiOperation(value = "查询点的id是否存在图谱中")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/exist/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<ExistModel> exist(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidExistGraphQueryVo graphQuery) {
        ExistModel existModel = this.graphConnectService.queryExist(projectId, graphQuery);
        return new ResponseEntity<>(existModel, HttpStatus.OK);
    }

    /**
     * 多个结点两两间的最短路径
     *
     * @param projectId  项目id
     * @param graphQuery 查询类
     * @return 最短路径
     */
    @ApiOperation(value = "多个结点两两间的最短路径")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/shortPath/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<GraphModel> shortPath(@PathVariable("projectId") Long projectId, @RequestBody @Valid ValidShortGraphQueryVo graphQuery) {
        GraphModel graphModel = this.graphConnectService.shortPath(projectId, graphQuery);
        return new ResponseEntity<>(graphModel, HttpStatus.OK);
    }

    /**
     * 添加实体
     *
     * @param projectId      项目id
     * @param addVertexModel 添加实体
     * @return
     */
    @ApiOperation(value = "添加实体")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/vertex/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<VertexModel> addVertexs(@PathVariable("projectId") Long projectId,
                                                  @RequestBody AddVertexModel addVertexModel) {
        VertexModel vertexModel = this.graphConnectService.addVertex(projectId, addVertexModel);
        return new ResponseEntity<>(vertexModel, HttpStatus.OK);
    }

    /**
     * 添加关系
     *
     * @param projectId    项目id
     * @param addEdgeModel 添加关系实体
     * @return List<EdgeModel>
     */
    @ApiOperation(value = "添加边")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/edge/{projectId}", method = RequestMethod.POST)
    public ResponseEntity<List<EdgeModel>> addEdges(@PathVariable("projectId") Long projectId,
                                                    @RequestBody AddEdgeModel addEdgeModel) {
        List<EdgeModel> edgeModelList = this.graphConnectService.addEdges(projectId, addEdgeModel);
        return new ResponseEntity<>(edgeModelList, HttpStatus.OK);
    }

    /**
     * 修改实体或关系类型
     *
     * @param projectId         项目id
     * @param validModifyTypeVo 修改类型Vo
     * @return ResponseEntity
     */
    @ApiOperation(value = "修改实体或关系类型")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/type/{projectId}", method = RequestMethod.PUT)
    public ResponseEntity<Boolean> updateType(@PathVariable("projectId") Long projectId,
                                              @RequestBody ValidModifyTypeVo validModifyTypeVo) {
        this.graphConnectService.updateType(projectId, validModifyTypeVo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 修改实体或关系属性
     *
     * @param projectId              项目id
     * @param validModifyAttributeVo 修改属性Vo
     * @return ResponseEntity
     */
    @ApiOperation(value = "修改实体或关系属性")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/attribute/{projectId}", method = RequestMethod.PUT)
    public ResponseEntity<Boolean> updateAttribute(@PathVariable("projectId") Long projectId,
                                                   @RequestBody ValidModifyAttributeVo validModifyAttributeVo) {
        this.graphConnectService.updateAttribute(projectId, validModifyAttributeVo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 删除实体或关系
     *
     * @param projectId 项目id
     * @param id        实体或者关系 id
     * @param vertex    是否是实体
     * @return ResponseEntity
     */
    @ApiOperation(value = "删除实体或关系")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true),
            @ApiImplicitParam(name = "id", value = "实体或者关系 id", example = "1", required = true),
            @ApiImplicitParam(name = "vertex", value = "是否是实体", example = "true", required = true)
    })
    @RequestMapping(value = "/delete/{projectId}/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Boolean> delete(@PathVariable("projectId") Long projectId, @PathVariable("id") Object id,
                                          @RequestParam("vertex") Boolean vertex) {
        this.graphConnectService.delete(projectId, id, vertex);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 删除实体类型
     *
     * @param projectId 项目id
     * @param id        实体或者关系 id
     * @param typeList  类型列表
     * @return ResponseEntity
     */
    @ApiOperation(value = "删除实体类型")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true),
            @ApiImplicitParam(name = "id", value = "实体或者关系 id", example = "1", required = true)
    })
    @RequestMapping(value = "/delete/vertex/{projectId}/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Boolean> deleteVertexType(@PathVariable("projectId") Long projectId, @PathVariable("id") Object id,
                                                    @RequestBody List<String> typeList) {
        this.graphConnectService.deleteVertexType(projectId, id, typeList);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 删除实体或官修属性
     *
     * @param projectId     项目id
     * @param id            实体或者关系 id
     * @param attributeList 属性列表
     * @param vertex        是否是实体
     * @return
     */
    @ApiOperation(value = "删除实体或官修属性")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true),
            @ApiImplicitParam(name = "id", value = "实体或者关系 id", example = "1", required = true),
            @ApiImplicitParam(name = "vertex", value = "是否是实体", example = "true", required = true)
    })
    @RequestMapping(value = "/delete/attribute/{projectId}/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Boolean> deleteAttribute(@PathVariable("projectId") Long projectId, @PathVariable("id") Object id,
                                                   @RequestBody List<String> attributeList, @RequestParam("vertex") Boolean vertex) {
        this.graphConnectService.deleteAttribute(projectId, id, attributeList, vertex);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 停止图谱实例
     *
     * @param projectId 项目id
     * @return ResponseEntity
     */
    @ApiOperation(value = "停止图谱实例")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "projectId", value = "项目id", example = "1", required = true)
    })
    @RequestMapping(value = "/stop/{projectId}", method = RequestMethod.DELETE)
    public ResponseEntity<Boolean> stop(@PathVariable("projectId") Long projectId) {
        this.graphConnectService.closeConnect(projectId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
