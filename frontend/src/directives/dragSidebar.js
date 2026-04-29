/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2020-08-20 21:16:00
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-02-22 10:50:16
 * @FilePath: /GraphInsight/src/directives/dragSidebar.js
 */
// 拖拽侧边框

import Vue from 'vue';

Vue.directive('dragSidebar', {
    bind(el, binding) {
        const sidebar = el;
        el.style.position = 'relative';
        const dragLine = sidebar.appendChild(document.createElement("div"));
        dragLine.style.position = 'absolute';
        dragLine.style.height = '100%';
        dragLine.style.width = '5px';
        dragLine.style[binding.value] = '0';
        dragLine.style.top = '0';
        dragLine.style.cursor = 'col-resize';

        dragLine.onmousedown = (downEvent) => {
            downEvent.preventDefault();
            const startX = downEvent.clientX;
            const sidebarWidth = el.offsetWidth;
            
            document.onmousemove = (moveEvent) => {
                const endX = moveEvent.clientX;
                let addWidth = binding.value == 'left' ? (startX - endX) : -(startX - endX)
                // 280px为最小宽度 860px为最大宽度 8为padding长度
                if(el.offsetWidth <= 340 && addWidth < 0 || 
                el.offsetWidth >= 860 && addWidth > 0) {
                    return;
                }
                else {
                    el.style.width = (sidebarWidth + addWidth) + 'px';
                }
            }

            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        }

    }
})