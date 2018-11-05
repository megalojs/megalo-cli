# template-ksvue

> kaola vue ssr project template

# start

```
$ nenpm install -g @kaola/ksvue
//如果第一次使用nenpm，进入http://npm.hz.netease.com/

$ ksvue my-project
```

# 目录结构

```
├── client          // client package
├── scripts
├── server          // server package
├── .gitignore
├── .*              // secondary files
├── package.json
└── README.md
```

## client
```
├── build                           // 打包脚本
├── config                          // 打包配置信息
├── src                             // 源码
│   ├── api                         // 接口管理
│   ├── base                        // 工程基文件
│   ├── assets                      // 全局静态资源
│   ├── components                  // 全局组件
│   ├── helper                      // 帮助文件
│   ├── mods                        // 全局工具组
│   ├── modules                     // 全局模块
│   ├── pages                       // 单页集合
│   ├── router                      // 路由文件
│   ├── static                      // 全局静态文件，最终会 copy 到打包目录(server/app/public)下的 static 目录内
│   ├── store                       // vuex 数据管理
│   ├── view                        // 模板和静态资源，layout 为 ssr 模板文件，其他为静态页面，最终会 copy 到打包目录(server/app/view)下的 static 目录内
│   ├── app.js                      // 入口文件
│   ├── App.vue                     // router 管理页
│   ├── entry-client.js             // client 打包脚本
│   └── entry-server.js             // server 打包脚本
└── .*                              // secondary files
```
