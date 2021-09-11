/*
 * @Author: MarioGo
 * @Date: 2021-09-10 14:29:58
 * @LastEditTime: 2021-09-11 19:32:14
 * @LastEditors: MarioGo
 * @Description: 文件上传接口
 * @FilePath: /manager-server/server/routes/uploadFile.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
const { controller, get, post, put } = require('../lib/decorator');
const File = require('../models/fileSchema');
const Utils = require('../utils/util');
const fs = require('fs');
const path = require('path');

@controller('/api/file')
export class fileController {
  // 单个文件上传
  @post('/uploadFile')
  async uploadFile(ctx, next) {
    // 上传单个文件
    const file = ctx.request.files.file; // 获取上传文件
    console.log(
      '%c 🥜 file: ',
      'font-size:20px;background-color: #FFDD4D;color:#fff;',
      ctx.request.files
    );
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    //重命名
    const newFileName =
      Math.random().toString(16).substr(2) + '.' + file.name.split('.').pop();
    // 创建写入路径
    let filePath =
      path.join(__dirname, '../../public/upload/') + `/${newFileName}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
    return (ctx.body = Utils.success({ msg: '上传成功' }));
  }

  //多个文件上传
  @post('/uploadMoreFile')
  async uploadMoreFile(ctx, next) {
    const  files = ctx.request.files.file; // 获取上传文件
    for (let file of files) {
      // 创建可读流
      const reader = fs.createReadStream(file.path);
      // 获取上传文件扩展名
      let filePath = path.join(__dirname, '../../public/upload/') + `/${file.name}`;
      // 创建可写流
      const upStream = fs.createWriteStream(filePath);
      // 可读流通过管道写入可写流
      reader.pipe(upStream);
    }
    return (ctx.body = Utils.success({ msg: '多文件上传成功' }));
  }


  @get('/appList')
  async getAppList(ctx, next) {
    const { appName } = ctx.request.query;
    try {
      let params = {}
      // 根据条件查询所有用户列表   排除这些字段不需要返回 { _id: 0, userPwd: 0 }
      const list = await  File.find(params);
      ctx.body = Utils.success({
        list
      });
    } catch (error) {
      ctx.body = Utils.fail(`查询异常:${error.stack}`);
    }
  }
  //文件操作
  @post('/fileOperate')
  async setFileOperate(ctx, next) {
    const { _id, action, ...params } = ctx.request.body;
    //创建
    let info, res;
    try {
      if (action === 'create') {
        res = await File.create(params);
        info = '创建成功';
      } else if (action === 'edit') {
        params.updateTime = new Date();
        res = await File.findByIdAndUpdate(_id, params);
        info = '编辑成功';
      } else {
        //todo:文件删除
        if (_id) {
          res = await File.findByIdAndDelete(_id);
          info = '删除成功';
        } else {
          ctx.body = Utils.fail(`缺少参数:_id`);
        }
      }
      ctx.body = Utils.success('', info);
    } catch (error) {
      console.log('error :>> ', error);
      ctx.body = Utils.fail(error.stack);
    }
  }
}
