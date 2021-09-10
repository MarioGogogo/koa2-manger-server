const { controller, get, post, put } = require('../lib/decorator');
const send = require('koa-send');

@controller('/api/v0')
export class userController {
  //api:app版本信息
  @get('/app_version')
  async app_version(ctx) {
    const data = {
      versionCode: 101, // 版本号
      versionName: '1.0.1', //对应版本名称
      versionInfo: '修复若干bugs', // 版本信息
      forceUpdate: false, //是否强制更新
      downloadUrl: 'http://127.0.0.1:4455/api/v0/download_app/__UNI__BD2F932.wgt',
    };
    ctx.body = {
      success: true,
      data: data,
    };
  }
   //api:app下载
  @get('/download_app/:name')
  async download_app(ctx) {
    const name = ctx.params.name;
    const path = `server/upload/${name}`;
    ctx.attachment(path);
    try {
      const res = await send(ctx, path);
      console.log('download_app :>> ', res);
    } catch (error) {
      ctx.body = {
        success: false,
        data: error,
      };
    }
  }
}
