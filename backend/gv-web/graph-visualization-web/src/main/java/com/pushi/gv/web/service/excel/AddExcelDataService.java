package com.pushi.gv.web.service.excel;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;

/**
 * 添加Excel数据图谱
 *
 * @author sii
 */
public interface AddExcelDataService {

    void exportAddExcelData(HttpServletResponse response);

    void addExcelData(Long projectId, MultipartFile excelFile);
}
