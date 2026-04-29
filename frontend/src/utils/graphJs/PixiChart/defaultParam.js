/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-08-24 15:45:38
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-11 16:33:54
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/defaultParam.js
 */
const zoomParam = {
    ZOOM_MAX: 30,
    ZOOM_MIN: 0
};

const nodeParam = {
    ICONSCALE: 0.5,
    NODE_RADIUS: 6,
    NODE_COLOR: 0x000000,
    NODE_BORDER_WIDTH: 5,
    NODE_BORDER_COLOR: 0x1989fa,
    PADDING: 0.5,
    MAXSCALE: 6,
    ORIGINSTYLE: {
        icon: '',           // 图标
        color: '0x778396',  // 背景色
        size: 1,            // 大小
        tag: 'name',        // 标签名
    },
    ANIMATIONNUMBER: 1000
};

const linkParam = {
    LINKWIDTH: 0.3,
    LINKCOLOR: 0xc3cbd3,
    LINKHIGHLIGHT: 0x1989fa,
    HITAREASCALE: 3,
    ORIGINSTYLE: {
        color: 0xc3cbd3,    // 颜色
        size: 1,            // 粗细
        label: 'name'       // 标签名
    }
};

const textParam = {
    FONTSIZE: 0.05,
    SCALEFONTSIZE: 0.5,
    TEXTBACKGROUNDTINT: 0xffffff,
    TEXTBACKGROUNDALPHA: 0.5,
    HIGHLIGHTTEXTBACKGROUNDTINT: 0xdddddd,
    HIGHLIGHTTEXTBACKGROUNDALPHA: 1,
    LEVELPADDING: 1.05,
    VERTICALPADDING: 1.1,
    MAXNUMBER: 1000
};

const triangleParam = {
    TRIANGLECOLOR: 0xc3cbd3,
    TRIANGLEWIDTH: 1,
    TRIANGLESEARCHCOLOR: 0xff0000
};

const selectRectParam = {
    BORDERCOLOR: 0x1d89d5,
    BACKGROUNDCOLOR: 0x237cf6,
    BACKGROUNDALPHA: 0.5
};

const HIDESCALE = 20;

const WORLDALPHA = 0.1;

const defaultParam = {
    DEFAULTSCREENWIDTH: 1200,
    DEFAULTSCREENHEIGHT: 700,
    DEFAULTNODEBORDER: ["HOVERBORDER", "HOVERSECONDBORDER"]
};

const layoutOrder = {
    0: "left",
    1: "bottom",
    2: "right",
    3: "top"
}

const layoutParam = {
    name:'force'
}

export {
    zoomParam,
    nodeParam,
    linkParam,
    textParam,
    triangleParam,
    HIDESCALE,
    defaultParam,
    layoutOrder,
    layoutParam,
    WORLDALPHA,
    selectRectParam
}