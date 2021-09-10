/*
 * @Author: MarioGo
 * @Date: 2021-07-01 23:08:32
 * @LastEditTime: 2021-09-10 18:15:45
 * @LastEditors: MarioGo
 * @Description: 文件描述
 * @FilePath: /manager-server/server/index.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
const Koa = require('koa');
const { resolve } = require('path');
const koaStatic = require('koa-static');
const R = require('ramda');
const MIDDLEWARES = ['common', 'router'];
const bodyParser = require('koa-bodyparser');
const koajwt = require('koa-jwt')

// 错误日志
const logger = require('koa-logger');
const log4js = require('./utils/log4j');
const util = require('./utils/util');
const onerror = require('koa-onerror');
const koaBody = require('koa-body');

//启动数据库
require('./config/db')

/**
 * 封装中间件
 * @param {*} app
 */
const useMiddlewares = (app) => {
  R.map(
    R.compose(
      R.forEachObjIndexed((initWith) => initWith(app)),
      require,
      (name) => resolve(__dirname, `./middlewares/${name}`)
    )
  )(MIDDLEWARES);
};

(async () => {
  //创建实例
  const app = new Koa();
  // error handler
  onerror(app);

  // 文件上传解析
  app.use(koaBody({
    multipart: true,
    // formidable: {
    //     maxFileSize: 2000*1024*1024    // 设置上传文件大小最大限制，默认20M
    // }
}));
  //解析post请求的参数
  app.use(bodyParser());
  // 配置静态资源
  const staticPath = '../views';
  app.use(koaStatic(resolve(__dirname, staticPath)));

  






  // bug:过滤某些不需要token的请求  会影响其他接口
  // app.use(koajwt({ secret: 'imooc' }).unless({
  //   path: [/^\/api\/login/]
  // }))
  
  // token认证失败配置
  app.use(async (ctx, next) => {
    log4js.info(`get params:${JSON.stringify(ctx.request.query)}`);
    log4js.info(`post params:${JSON.stringify(ctx.request.body)}`);
    await next().catch((err) => {
      if (err.message == 'jwt expired') {
        ctx.status = 200;
        ctx.body = util.fail('Token认证失败', util.CODE.AUTH_ERROR);
      } else {
        throw err;
      }
    });
  });
  //执行中间件
  await useMiddlewares(app);
  // 监听端口
  app.listen(4455, () => {
    console.log('http://127.0.0.1:4455 is runing');
  });
})();
