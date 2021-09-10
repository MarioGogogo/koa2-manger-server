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