/*
 * @Author: MarioGo
 * @Date: 2021-07-29 23:16:17
 * @LastEditTime: 2021-10-22 07:05:33
 * @LastEditors: MarioGo
 * @Description: 文件描述
 * @FilePath: /manager-server/server/routes/home.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
const { controller, get, post, put } = require('../lib/decorator');
const User = require('../models/userSchema')
const Utils = require('../utils/util')
const jwt = require('jsonwebtoken');

@controller('/api')
export class userController {
  @get('/leave/count')
  async getCount(ctx, next) {
    //验证token是否过期
    const token = ctx.request.headers.authorization.split(' ')[1]
    const payload = jwt.verify(token,'imooc')
    console.log('%c 🍍 payload: ', 'font-size:20px;background-color: #7F2B82;color:#fff;', payload);
    return ctx.body = Utils.success(3)
  
 
  }
}