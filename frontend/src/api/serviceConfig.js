import qs from 'qs'
import store from '../store'
import { vuexPrefix } from '@/settings.js'

let methodMap = {
    'get':'get',
    'getRepeat':'get',

    'post':'post',
    'postWithoutToken':'post',
    'upload':'post',
    'uploadExcel':'post',
    'download':'post',
    'postJSON':'post',
    'register' : 'post',

    'delete':'delete',
    'deleteRepeat':'delete',
    'deleteJSON': 'delete',
    'deleteParamBody': 'delete',

    'put':'put',
    'putRepeat':'put',
    'putJSON' : 'put',
}

/**
 * [getConfig description]
 * @param  {[type]} type [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export function getConfig(type,data){
    let conf = {},
        method = methodMap[type],
        token = '';
    switch(type){
        /** 正常get */
        case 'get':
            conf = {
                params:data,
                paramsSerializer(params){
                    return qs.stringify(params, {arrayFormat: 'repeat'})
                },
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        /** 上传 */
        case 'upload':
            conf = {
                data:data,
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'uploadExcel':
            conf = {
                data:data,
                headers:{
                    'Content-Type': 'multipart/form-data; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        /** 下载 */
        case 'download':
            conf = {
                data:qs.stringify(data),
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                },
                responseType: 'blob'
            }
            break;
        /** 正常post */
        case 'post':
            conf = {
                data:qs.stringify(data),
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'postWithoutToken':
            conf = {
                data:qs.stringify(data),
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            }
            break;
        case 'register':
            conf = {
                params: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }
            break;
        case 'delete':
            conf = {
                params:data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'deleteRepeat':
            conf = {
                params:data,
                paramsSerializer:function(input){
                    return qs.stringify(input,{allowDots:true,arrayFormat:'repeat'})
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'put':
            conf = {
                transformRequest: [function (input, headers) {
                    return qs.stringify(input, {allowDots: true, arrayFormat: 'indices'});
                }],
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'putRepeat':
            conf = {
                params:data,
                paramsSerializer:function(input){
                    return qs.stringify(input,{allowDots:true,arrayFormat:'repeat'})
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'getRepeat':
            conf = {
                params:data,
                paramsSerializer(params){
                    return qs.stringify(params, {allowDots:true,arrayFormat:'repeat'})
                },
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'authorization': token
                }
            }
            break;
        case 'postJSON':
            conf = {
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token
                }
            }
            break;
        case 'putJSON':
            conf = {
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token
                }
            }
            break;
        case 'deleteJSON':
            conf = {
                params:data,
                paramsSerializer(params){
                    return qs.stringify(params, {allowDots:true,arrayFormat:'repeat'})
                },
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token
                }
            }
            break;
        case 'deleteParamBody':
            conf = {
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token
                }
            }
            break;
    }
    conf.method = method;
    return conf;
}