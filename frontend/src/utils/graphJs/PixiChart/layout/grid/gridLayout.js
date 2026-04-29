/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-01-05 11:01:59
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-01-26 10:33:57
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/layout/grid/gridLayout.js
 */
export default function gridLayout(nodes, containerSize, defaultOffset = 200) {
    let level = 1, nodesLength = nodes.length, centerX = containerSize.width / 2, centerY = containerSize.height / 2;
    // 计算需要多大的level x level的矩形
    for (let i = nodes.length; i > Math.pow(level, 2); level++) {}
    // 排列
    let centerLevel = Math.round(level / 2), isEven = level % 2 == 0 ? true : false,
    offset = defaultOffset;
    for (let row = 0; row < level; row++) {
        for (let col = 0; col < level; col++) {
            let position = row * level + col;
            if (position > nodesLength - 1) break;
            let node = nodes[position];
            if (isEven) {
                if (row < (level + 1) / 2) {
                    node.y = centerY - (centerLevel - row) * offset
                } else {
                    node.y = centerY + (row - centerLevel) * offset
                }
                if (col < (level + 1) / 2) {
                    node.x = centerX - (centerLevel - col) * offset;
                } else {
                    node.x = centerX + (col - centerLevel) * offset;
                }
            } else {
                if (row < centerLevel) {
                    node.y = centerY - (centerLevel - row) * offset;
                } else if (row == centerLevel) {
                    node.y = centerY
                } else {
                    node.y = centerY + (row - centerLevel) * offset;
                }
                if (col < centerLevel) {
                    node.x = centerX - (centerLevel - col) * offset;
                } else if (col == centerLevel) {
                    node.x = centerX
                } else {
                    node.x = centerX + (col - centerLevel) * offset;
                }
            }
        }
    }
}