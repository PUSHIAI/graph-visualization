package com.pushi.gv.graph.excel;

import cn.hutool.poi.excel.ExcelReader;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.pushi.gv.graph.entity.graph.add.AddAttributeModel;
import com.pushi.gv.graph.entity.graph.add.AddEdgeModel;
import com.pushi.gv.graph.entity.graph.add.AddVertexModel;

public class ParseExcel {

    public static List<AddVertexModel> parseVertex(ExcelReader vertexReader) {
        List<Map<String, Object>> read = vertexReader.readAll();
        List<AddVertexModel> addVertexModelList = new ArrayList<>();
        read.forEach(map -> {
            if (map.get("实体类型") == null) {
                throw new NullPointerException("Excel表实体中有未填写的实体类型");
            }

            AddVertexModel addVertexModel = new AddVertexModel();
            addVertexModel.setLabels(Collections.singletonList(map.get("实体类型").toString().trim()));
            addVertexModel.setAttributeList(getAddAttributeModelList(map));

            if (map.get("序号") != null) {
                AddAttributeModel addAttributeModel = new AddAttributeModel();
                addAttributeModel.setName("index");
                addAttributeModel.setValue(map.get("序号").toString().trim());
                addVertexModel.getAttributeList().add(addAttributeModel);
            }
            addVertexModelList.add(addVertexModel);
        });
        return addVertexModelList;
    }

    public static List<AddEdgeModel> parseAddEdge(ExcelReader edgeReader) {
        List<Map<String, Object>> read = edgeReader.readAll();
        List<AddEdgeModel> addEdgeModelList = new ArrayList<>();
        read.forEach(map -> {
            AddEdgeModel addEdgeModel = new AddEdgeModel();
            if (map.get("关系类型") == null) {
                throw new NullPointerException("Excel表关系中有未填写的关系类型");
            }
            if (map.get("关系起点序号") == null) {
                throw new NullPointerException("Excel表关系中有未填写的关系起点序号");
            }
            if (map.get("关系终点序号") == null) {
                throw new NullPointerException("Excel表关系中有未填写的关系终点序号");
            }

            addEdgeModel.setType(map.get("关系类型").toString().trim());
            addEdgeModel.setStartVertexId(map.get("关系起点序号").toString().trim());
            addEdgeModel.setEndVertexId(map.get("关系终点序号").toString().trim());
            addEdgeModel.setAttributeList(getAddAttributeModelList(map));
            addEdgeModelList.add(addEdgeModel);
        });
        return addEdgeModelList;
    }

    private static List<AddAttributeModel> getAddAttributeModelList(Map<String, Object> map) {
        List<AddAttributeModel> attributeModelList = new ArrayList<>();
        for (int i = 1; i <= 300; i++) {
            if (map.get("属性名称" + i) == null || map.get("属性值" + i) == null || StringUtils.isBlank(map.get("属性名称" + i).toString())) {
                continue;
            }
            AddAttributeModel attributeModel = new AddAttributeModel();
            attributeModel.setName(map.get("属性名称" + i).toString().trim());
            attributeModel.setValue(map.get("属性值" + i).toString());
            if (map.get("是否索引" + i) != null) {
                attributeModel.setIndex(Boolean.getBoolean(map.get("是否索引" + i).toString()));
            } else {
                attributeModel.setIndex(false);
            }
            attributeModelList.add(attributeModel);
        }
        return attributeModelList;
    }
}
