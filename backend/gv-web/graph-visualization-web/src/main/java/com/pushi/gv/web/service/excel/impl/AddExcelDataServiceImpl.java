package com.pushi.gv.web.service.excel.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.time.StopWatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pushi.gv.web.service.excel.AddExcelDataService;
import com.pushi.gv.web.service.graphconnect.GraphConnectService;
import com.pushi.gv.graph.adapter.GraphAdapter;
import com.pushi.gv.graph.config.ExcleTemplateConfig;
import com.pushi.gv.graph.entity.connect.GraphConnectInfo;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;
import com.pushi.gv.graph.excel.ParseExcel;
import com.pushi.gv.graph.exceptions.GraphConnectException;
import com.pushi.gv.graph.factory.objectpool.GraphObjectPool;

/**
 * 添加Excel数据图谱实现层
 *
 * @author sii
 */
@Service
@Slf4j
public class AddExcelDataServiceImpl implements AddExcelDataService {

    @Autowired
    private ExcleTemplateConfig excleTemplateConfig;

    @Autowired
    private GraphConnectService graphConnectService;

    @Autowired
    private GraphObjectPool graphObjectPool;

    @Override
    public void exportAddExcelData(HttpServletResponse response) {
        long dateTime = System.currentTimeMillis();
        this.export(this.getWriter(dateTime), this.excleTemplateConfig.getFileName(), response);
        FileUtil.del(this.excleTemplateConfig.getTmpPath() + "/" + dateTime);
    }

    @Override
    public void addExcelData(Long projectId, MultipartFile excelFile) {
        try {
            StopWatch stopWatch = new StopWatch();
            stopWatch.start();
            List<AddVertexModel> addVertexModelList = ParseExcel.parseVertex(ExcelUtil.getReader(excelFile.getInputStream(), "实体"));
            List<AddEdgeModel> addEdgeModelList = ParseExcel.parseAddEdge(ExcelUtil.getReader(excelFile.getInputStream(), "关系"));
            log.info("excel 表转换耗时：{} ms", stopWatch.getTime());

            GraphConnectInfo graphConnectInfo = this.graphConnectService.getGraphByProjectId(projectId);
            GraphAdapter graphAdapter = null;
            try {
                graphAdapter = this.graphObjectPool.borrowObject(graphConnectInfo);
                graphAdapter.batchAddVertexs(addVertexModelList);
                graphAdapter.batchAddEdges(addEdgeModelList);
            } catch (Exception e) {
                this.graphObjectPool.clear(graphConnectInfo);
                throw new GraphConnectException(e.getMessage(), e);
            } finally {
                if (graphAdapter != null) {
                    this.graphObjectPool.returnObject(graphConnectInfo, graphAdapter);
                }
            }
        } catch (Exception e) {
            throw new GraphConnectException(e.getMessage(), e);
        }
    }

    private ExcelWriter getWriter(Long dateTime) {
        try {
            String tmpPath = this.excleTemplateConfig.getTmpPath() + "/" + dateTime;
            String tmpFile = URLDecoder.decode(tmpPath + "/" + this.excleTemplateConfig.getFileName(), "utf-8");
            FileUtil.copy(URLDecoder.decode(FileUtil.getAbsolutePath(this.excleTemplateConfig.getPath() + "/" + this.excleTemplateConfig.getFileName()), "utf-8"), tmpFile, true);
            return ExcelUtil.getWriter(tmpFile);
        } catch (Exception e) {
            throw new GraphConnectException(e.getMessage(), e);
        }
    }

    /**
     * 导出文件
     *
     * @param excelWriter 文件写入器
     * @param fileName    文件名称
     * @param response    响应
     */
    private void export(ExcelWriter excelWriter, String fileName, HttpServletResponse response) {
        try {
            String encodedfileName = new String(fileName.getBytes(), "ISO8859-1");
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedfileName + "\"");
            response.setContentType("application/vnd.ms-excel;charset=utf-8");
            ServletOutputStream out = response.getOutputStream();
            excelWriter.flush(out);
            excelWriter.close();
            IoUtil.close(out);
        } catch (IOException e) {
            throw new RuntimeException("导出出错", e);
        }
    }
}
