/*
 * @Author: huangyixin
 * @Date: 2022-01-04 15:41:00
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-01-04 17:23:50
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/utils/downloadTools.js
 */
import * as XLSX from 'xlsx';

export function download_blob(blob,fileName){
    let downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export function exportXlsx(xlsxData,fileName){
    let wopts = {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
        },
        wb = XLSX.utils.book_new();

    for(let sheet in xlsxData){
        if(xlsxData[sheet] instanceof Array){
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(xlsxData[sheet]), sheet);
        }else{
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(xlsxData[sheet].data,{header:xlsxData[sheet].header}),sheet);
        }
    }
    
    download_blob(new Blob([s2ab(XLSX.write(wb, wopts))], {
        type: "application/octet-stream"
    }), fileName); 
}

export function exportJson(data,fileName){
    let jsonStr = JSON.stringify(data), //  把 JSON 对象转换为字符串
        blob = new Blob([jsonStr]); //  创建 blob 对象
    download_blob(blob,fileName);
}