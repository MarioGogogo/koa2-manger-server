
const {
  controller,
  get,
  post,
  del,
  auth,
  admin,
  required,
} = require('../lib/decorator');
const Utils = require('../utils/util');
const email = require('../utils/util_email');
/*
邮件发送
*/
// 开启一个 SMTP 连接池
@controller('/api')
export class mailController {
  @get('/sendemail')
  async sendMail(ctx, next) {
    async function timeout() {
      return new Promise((resolve, reject) => {
        email.sendMail((state) => {
          resolve(state);
        });
      });
    }
    await timeout().then((state) => {
      if (state) {
        return  ctx.body = Utils.success('','发送成功');
      } else {
        return ctx.body = Utils.fail('','发送失败');
      }
    });
  }
}
