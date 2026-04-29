package com.pushi.gv.web.service.graphconnect;

import java.util.List;

import org.springframework.data.domain.Page;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.graph.EdgeModel;
import com.pushi.gv.graph.entity.graph.ExistModel;
import com.pushi.gv.graph.entity.graph.GraphModel;
import com.pushi.gv.graph.entity.graph.SchemaModel;
import com.pushi.gv.graph.entity.graph.VertexModel;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;
import com.pushi.gv.graph.entity.graph.modify.ModifyAttribute;
import com.pushi.gv.graph.entity.graph.modify.ModifyType;
import com.pushi.gv.graph.entity.graph.query.GraphQuery;

public interface GraphConnectService {

    GraphConnectInfo getGraphByProjectId(Long projectId);

    void testConnect(ProjectVo projectVo);

    void closeConnect(Long projectId);

    SchemaModel getSchema(Long projectId);

    List<String> getAllAttributesName(Long projectId);

    List<VertexModel> getVertexList(Long projectId, GraphQuery graphQuery);

    Page<VertexModel> getVertexPage(Long projectId, GraphQuery graphQuery);

    GraphModel expand(Long projectId, GraphQuery graphQuery);

    ExistModel queryExist(Long projectId, GraphQuery graphQuery);

    GraphModel shortPath(Long projectId, GraphQuery graphQuery);

    VertexModel addVertex(Long projectId, AddVertexModel addVertexModel);

    List<EdgeModel> addEdges(Long projectId, AddEdgeModel addEdgeModel);

    void updateType(Long projectId, ModifyType modifyType);

    void updateAttribute(Long projectId, ModifyAttribute modifyAttribute);

    void delete(Long projectId, Object id, Boolean vertex);

    void deleteVertexType(Long projectId, Object id, List<String> typeList);

    void deleteAttribute(Long projectId, Object id, List<String> attributeList, Boolean vertex);
}
