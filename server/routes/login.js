const { controller, get, post, put } = require('../lib/decorator');
const User = require('../models/userSchema');
const Utils = require('../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

@controller('/api')
export class userController {
  @post('/login')
  async login(ctx, next) {
    const { userName, userPwd } = ctx.request.body;
    const res = await User.findOne({
      userName,
      userPwd: md5(userPwd)
    },'userId userName userEmail state role deptId roleList')
    if (res) {
      const data = res._doc;
      // 生成token
      const token = jwt.sign(
        {
          data,
        },
        'imooc',
        { expiresIn: '1h' }     //通常1h  
      );
      data.token = token;
      console.log('data',data);
      delete data._id;  //删除_id
      ctx.body = Utils.success(data);
    } else {
      ctx.body = Utils.fail('账号密码不正确');
    }
    // return (ctx.body = Utils.success(res));
  }
}
