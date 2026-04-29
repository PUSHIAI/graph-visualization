/*
 * @Author: huangyixin
 * @Date: 2020-08-01 16:03:51
 * @LastEditors: huangyixin
 * @LastEditTime: 2020-08-31 17:15:06
 * @Description: In User Settings Edit
 * @FilePath: /KMP4/src/utils/message.js
 */
import { Message } from 'element-ui';

export function show_message(message,type = 'info',duration = 3000){
    Message({
        message: message,
        type: type,
        duration: duration,
        offset: 40
    })
}