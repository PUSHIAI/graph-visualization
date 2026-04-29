/*
 * @Author: huangyixin
 * @Date: 2020-08-01 17:20:59
 * @LastEditors: huangyixin
 * @LastEditTime: 2021-12-14 15:15:28
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/assets/icons/index.js
 */
import Vue from 'vue';
import SvgIcon from '@/components/common/SvgIcon';// svg component

// register globally
Vue.component('svg-icon', SvgIcon);

const req = require.context('./svg', true, /\.svg$/);
const picker = require.context('./picker', true, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);
requireAll(picker);
console.log('req:', requireAll(req));
console.log('req:', requireAll(picker));