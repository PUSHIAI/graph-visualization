import axios from 'axios';
import { getConfig } from './serviceConfig'
import { apiMapper } from './mappers'
// import { show_message } from '@/utils/message';
import router from '@/router'
import _ from 'lodash';
import { unknownErrorTip } from '@/settings'
import store from '@/store'
import { vuexPrefix } from '@/settings.js'

axios.defaults.timeout = 1800000;

if(process.env.NODE_ENV === 'production'){
    axios.defaults.baseURL = 'http://47.106.10.194:82';
}else{
    axios.defaults.baseURL = '';
}
console.log('这个是baseURL');
console.log(axios.defaults.baseURL);

const axiosCommon = axios.create(); // 通用前后端通信axios

//封装提示框
function m(info, callback) {
    // show_message(info.message, info.type);
    callback && callback();
}

//节流提示框
let throttleMessage = _.throttle(m, 3000, { 'trailing': false });

//http request 拦截器
axiosCommon.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

let whileList = [10100002,10100001,10080004];

//http response 拦截器
axiosCommon.interceptors.response.use(
    response => {
        console.log(response);
        if (response.data.code == 200) {
            return response.data;
        } else {
            if (response.config.headers.noTip != true && !whileList.includes(response.data.code)) {
                throttleMessage({
                    message: response.data.message || unknownErrorTip,
                    type: 'warning'
                });
            }
            if ((response.data.message == '用户不在群组，联系管理员加入群组') || ((response.data.code == -1) && (response.data.message == "当前没有权限操作"))) {
                router.push({ name: '404' });
            }
            return response.data;
        }
    },
    error => {
        try {
            if (error.response.config.headers.noTip != true) {
                if (error.response.status == 401) {
                    throttleMessage({
                            message: '请先登录',
                            type: 'warning'
                        },
                        () => {
                            let url = window.location.hash.replace('#/', '/');
                            store.commit('SET_LASTURL', url);
                            store.commit('SET_LASTNAME', store.state[`${vuexPrefix}_user`].userName);
                            router.push({ path: '/login' });
                        });
                } else {
                    throttleMessage({
                        message: error.response.data.message || unknownErrorTip,
                        type: 'error'
                    })
                }
            }
        } catch (err) {}

        return Promise.reject(error);
    }
);


let cancelToken = null,
    source = null;

export default {
    /**
     * 取消请求，这里只能取消一条请求，这个可以通过循环来解决，不过不优雅
     */
    cancelRequest() {
        source && source.cancel('请求已取消');
    },
    /**
     * @param  {[type]} name     请求地址名称
     * @param  {Object} option   请求参数，结构{ param = {}, urlParam = {}, query = undefined }
     * @return {[type]}          返回promise对象
     */
    doRequest(name, option = {}) {
        let {
            param = {},
            urlParam = {},
            query = undefined,
            noTip = false,
            noSignal = false
        } = option;

        /* 匹配路径参数 */
        let baseUrl = apiMapper[name].url,
            urlRegex = /\{(.+?)\}/g,
            pathParam = baseUrl.match(urlRegex)
        if (pathParam && pathParam.length > 0) {
            for (let [index, item] of pathParam.entries()) {
                let p = item.replace('{', '');
                p = p.replace('}', '');
                if (urlParam[p] == undefined) {
                    console.warn(`参数${p}未定义`);
                } else {
                    baseUrl = baseUrl.replace(item, urlParam[p]);
                }
            }
        }

        if (query) {
            let keyPairs = [];
            for (let key in query) {
                keyPairs.push(`${key}=${query[key]}`);
            }
            baseUrl = baseUrl + '?' + keyPairs.join('&');
        }

        /* 添加请求地址和端口 */
        // if (process.env.NODE_ENV === 'production') {
        //     baseUrl = window.location.origin + baseUrl;
        // }
        /* 初始化参数 */
        let type = apiMapper[name].type,
            conf = { url: baseUrl, ...(getConfig(type, param)) };

        /** 是否有提示 */
        if (noTip) {
            conf.headers.noTip = true;
        }

        if (!noSignal) {
            conf.signal = store.state.abortControllerArr.signal;
        }

        cancelToken = axios.CancelToken;
        source = cancelToken.source();
        conf.cancelToken = source.token;

        /* 发出请求 */
        return axiosCommon(conf);
    },
}