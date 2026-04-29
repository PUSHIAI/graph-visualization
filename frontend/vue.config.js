/*
 * @Author: huangyixin
 * @Date: 2021-12-02 17:31:53
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-01-24 17:25:17
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/vue.config.js
 */
let { devProxy } = require('./src/settings');
const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}


/** 开发环境本地代理 */
let proxyObj = {};

if (process.env.NODE_ENV == 'development') {
    let devProxyForRequest;
    switch (process.env.VUE_APP_REQUEST) {
        case 'dev':
            devProxyForRequest = devProxy.dev;
            break;
        case 'test':
            devProxyForRequest = devProxy.test;
            break;
        case 'prod':
            devProxyForRequest = devProxy.prod;
            break;
        default:
            devProxyForRequest = devProxy.dev;
            break;
    }
    console.log(process.env.VUE_APP_REQUEST, devProxyForRequest);
    devProxyForRequest.pattern.forEach((value, index) => {
        proxyObj[value.name] = {
            target: (value.url || devProxyForRequest.target) + ':' + value.port,
            changeOrigin: true,
            pathRewrite: {
                [`^${value.name}`]: value.rewrite ? value.name : '/'
            },
            proxyTimeout: 1800000,
            timeout: 1800000
        };
    });
}
console.log(proxyObj)

let config;
if (process.env.NODE_ENV === 'production') {
    config = {
        publicPath: '',
        css: {
            loaderOptions: { // 向 CSS 相关的 loader 传递选项
                less: {
                    javascriptEnabled: true
                }
            }
        }
    }
} else {
    config = {
        publicPath: './',
        devServer: {
            // can be overwritten by process.env.HOST
            host: '0.0.0.0',
            port: 8080,
            proxy: proxyObj, // 设置代理
        },
        chainWebpack: config => {
            config.resolve.alias
                .set('@', resolve('src'))
                .set('src', resolve('src'))
                .set('common', resolve('src/common'))
                .set('components', resolve('src/components'));
        },
        pluginOptions: {
            electronBuilder: {
                builderOptions: {
                    "appId": "graphInsight.pushiai",
                    "productName": "graphInsight",
                    "copyright": "Copyright © 2021 pushiai",
                    "directories": {
                        "buildResources": "build",
                        "output": "dist"
                    },
                    // "mac": {
                    //     "category": "public.app-category.utilities"
                    // },
                    // "dmg": {
                    //     "background": "build/background.jfif",
                    //     "icon": "build/icons/icon.icns",
                    //     "iconSize": 100,
                    //     "contents": [
                    //         {
                    //             "x": 380,
                    //             "y": 180,
                    //             "type": "link",
                    //             "path": "/Applications"
                    //         },
                    //         {
                    //             "x": 130,
                    //             "y": 180,
                    //             "type": "file"
                    //         }
                    //     ],
                    //     "window": {
                    //         "width": 540,
                    //         "height": 380
                    //     }
                    // },
                    "win": {
                        target: [
                            {
                                target: "nsis", //利用nsis制作安装程序,打包文件的后缀为exe
                                arch: [
                                    "ia32" //32位
                                ]
                            }
                        ],
                        "icon": "build/icons/icon.ico"
                    },
                    "nsis": {
                        "oneClick": false,
                        "language": "2052",
                        "perMachine": true,
                        "allowToChangeInstallationDirectory": true
                    }
                }
            }
        }
    };
}

config.chainWebpack = function chainWebpack(cf) {
    //set svg-sprite-loader
    cf.module
        .rule('svg')
        .exclude.add(resolve('src/assets/icons'))
        .end();
    cf.module
        .rule('icons')
        .test(/\.(svg|picker)$/)
        .include.add(resolve('src/assets/icons'))
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader')
        .options({
            symbolId: 'icon-[folder]-[name]'
        })
        .end()
        .before('svg-sprite-loader')
        .use('svgo-loader')
        .loader('svgo-loader')
        .options({
            plugins: [
            //!!!!!!!!!!!!!!!重点就是改这个位置，加个插件名字
            {
                name: 'removeAttrs',
                params: {
                attrs: '(fill|stroke)'
                }
            }
            ]
        })
        .end();
    cf.module
        .rule("worker")
        .test(/\.worker\.js$/)
        .use("worker-loader")
        .loader("worker-loader")
        .options({
          inline: "fallback"
        })
        .end();
    cf.module.rule("js").exclude.add(/\.worker\.js$/);
    cf.resolve.alias.set('@icons', resolve('src/assets/icons'));
}

module.exports = config;