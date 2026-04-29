package com.pushi.gv.web.service.graphconnect.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.pushi.gv.entity.vo.graphvisualization.project.ProjectVo;
import com.pushi.gv.web.entity.project.Project;
import com.pushi.gv.web.repository.ProjectRepository;
import com.pushi.gv.web.service.graphconnect.GraphConnectService;
import com.pushi.gv.graph.adapter.GraphAdapter;
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
import com.pushi.gv.graph.exceptions.GraphConnectException;
import com.pushi.gv.graph.factory.objectpool.GraphObjectPool;

@Service
@Slf4j
public class GraphConnectServiceImpl implements GraphConnectService {

    @Autowired
    private GraphObjectPool graphObjectPool;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public GraphConnectInfo getGraphByProjectId(Long projectId) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.getProject(projectId);

        GraphConnectInfo graphConnectInfo = new GraphConnectInfo();
        BeanUtil.copyProperties(project, graphConnectInfo, CopyOptions.create().setIgnoreNullValue(true)
                .setIgnoreError(false).setEditable(GraphConnectInfo.class));
        return graphConnectInfo;
    }

    @Override
    public void testConnect(ProjectVo projectVo) {
        GraphAdapter graphAdapter = null;
        GraphConnectInfo graphConnectInfo = new GraphConnectInfo();
        try {
            BeanUtil.copyProperties(projectVo, graphConnectInfo, CopyOptions.create().setIgnoreNullValue(true)
                    .setIgnoreError(false).setEditable(GraphConnectInfo.class));

            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            GraphQuery graphQuery = new GraphQuery();
            graphQuery.setPageSize(1L);
            graphQuery.setCurrentPage(0L);
            graphAdapter.getVertexs(graphQuery);
        } catch (Exception e) {
            throw new GraphConnectException("测试连接失败，请检查连接信息是否正确", e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.clear(graphConnectInfo);
            }
        }
    }

    @Override
    public void closeConnect(Long projectId) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);
        try {
            this.graphObjectPool.clear(graphConnectInfo);
        } catch (Exception e) {
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            this.graphObjectPool.clear();
        }
    }

    @Override
    public SchemaModel getSchema(Long projectId) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            return graphAdapter.getSchema();
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public List<String> getAllAttributesName(Long projectId) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);
        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            return graphAdapter.getAllAttributes();
        } catch (Exception e) {
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public List<VertexModel> getVertexList(Long projectId, GraphQuery graphQuery) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            List<VertexModel> vertexModelList = graphAdapter.getVertexs(graphQuery);
            return vertexModelList;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public Page<VertexModel> getVertexPage(Long projectId, GraphQuery graphQuery) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            List<VertexModel> vertexModelList = graphAdapter.getVertexs(graphQuery);
            Long totalCount = graphAdapter.count(graphQuery);
            Pageable pageable = PageRequest.of(
                    graphQuery.getCurrentPage() == null || graphQuery.getCurrentPage() < 0L ? 0 : graphQuery.getCurrentPage().intValue(),
                    graphQuery.getPageSize() == null || graphQuery.getPageSize() < 0L ? 10 : graphQuery.getPageSize().intValue());
            Page<VertexModel> vertexModelPage = new PageImpl<>(vertexModelList, pageable, totalCount);
            return vertexModelPage;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public GraphModel expand(Long projectId, GraphQuery graphQuery) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            GraphModel graphModel = graphAdapter.expand(graphQuery);
            return graphModel;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public ExistModel queryExist(Long projectId, GraphQuery graphQuery) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            ExistModel existModel = graphAdapter.queryExist(graphQuery);
            return existModel;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public GraphModel shortPath(Long projectId, GraphQuery graphQuery) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            GraphModel graphModel = graphAdapter.shortPath(graphQuery);
            return graphModel;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    public VertexModel addVertex(Long projectId, AddVertexModel addVertexModel) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            VertexModel vertexModel = graphAdapter.addVertex(addVertexModel);
            return vertexModel;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public List<EdgeModel> addEdges(Long projectId, AddEdgeModel addEdgeModel) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            List<EdgeModel> edgeModelList = graphAdapter.addEdges(addEdgeModel);
            return edgeModelList;
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public void updateType(Long projectId, ModifyType modifyType) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            graphAdapter.updateType(modifyType);
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public void updateAttribute(Long projectId, ModifyAttribute modifyAttribute) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            graphAdapter.updateAttribute(modifyAttribute);
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public void delete(Long projectId, Object id, Boolean vertex) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            graphAdapter.delete(id, vertex);
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public void deleteVertexType(Long projectId, Object id, List<String> typeList) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            graphAdapter.deleteVertexType(id, typeList);
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    @Override
    public void deleteAttribute(Long projectId, Object id, List<String> attributeList, Boolean vertex) {
        GraphConnectInfo graphConnectInfo = this.getGraphByProjectId(projectId);

        GraphAdapter graphAdapter = null;
        try {
            graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
            graphAdapter.deleteAttribute(id, attributeList, vertex);
        } catch (Exception e) {
            this.graphObjectPool.clear(graphConnectInfo);
            throw new GraphConnectException(e.getMessage(), e);
        } finally {
            if (graphAdapter != null) {
                this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
            }
        }
    }

    private Project getProject(Long projectId) {
        if (projectId == null) {
            throw new NullPointerException("参数错误");
        }

        Project project = this.projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new NullPointerException("未查询到项目");
        }
        return project;
    }
}
