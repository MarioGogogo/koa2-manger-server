//依赖的两个模块
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const Utils = require('../utils/util');
var to = 'jerrychen_23@126.com'; //发送地址
// var to='admin@xxx.com,editor@xxx.com'; //发送给多个人，英文逗号隔开

let orderNo = Utils.formateDate(new Date(), 'yyyyMMdd');
var subject = orderNo+'博客usr文件备份'; //发送的标题
var html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>邮箱美化</title>
    <style>
      .box {
        position: relative;
        color: #555;
        letter-spacing: 2px;
        font: 12px/1.5 PingFangSC-Light, Microsoft YaHei, Tahoma, Helvetica,
          Arial, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        border-top: 1px solid #d8d8d863;
        border-right: 1px solid rgb(224 224 224);
        border-left: 1px solid #d8d8d863;
        box-shadow: rgb(203, 208, 218) 0px 2px, rgba(48, 52, 63, 0.2) 0px 3px,
          rgba(48, 52, 63, 0.2) 0px 7px 7px,
          rgb(255, 255, 255) 0px 0px 0px 1px inset;
        border-radius: 5px;
        background: 0 0 repeat-x #fff;
        background-image: -webkit-repeating-linear-gradient(
          135deg,
          #db254d,
          #db254d 20px,
          #fff 20px,
          #fff 35px,
          #3f8ef5 35px,
          #3f8ef5 55px,
          #fff 55px,
          #fff 70px
        );
        background-image: repeating-linear-gradient(
          -45deg,
          #db254d,
          #db254d 20px,
          #fff 20px,
          #fff 35px,
          #3f8ef5 35px,
          #3f8ef5 55px,
          #fff 55px,
          #fff 70px
        );
        background-size: 100% 10px;
      }
      .box-in {
        padding: 0 15px 8px;
      }
      h2 {
        border-bottom: 1px solid #e9e9e9;
        font-size: 18px;
        font-weight: normal;
        padding: 10px 0 10px;
      }
      .title {
        color: #12addb;
      }
      .email-content {
        font-size: 14px;
        color: #777;
        padding: 0 10px;
        margin-top: 10px;
      }
      .email-content > p {
        background-color: #f5f5f5;
        border: 0px solid #ddd;
        padding: 10px 15px;
        margin: 18px 0;
      }
      .email-center {
        text-align: center;
        font-size: 12px;
        line-height: 14px;
        color: rgb(163, 163, 163);
        padding: 5px 0px;
      }
      .email-center .email-center-div {
        color: #888;
        padding: 10px;
      }
      .email-center .email-center-p {
        margin: 0;
        padding: 0;
        letter-spacing: 1px;
        line-height: 2;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="box-in">
        <h2>
          <span class="title"><br />❀</span>&nbsp;${orderNo}
        </h2>
        <div class="content">
          <div class="email-content">
            <p>
              这是从JeremyChan博客由自动发送的博客设置备份文件，备份文件详见邮件附件！
            </p>
          </div>
        </div>
        <div class="email-center">
          <div class="email-center-div">
            <p class="email-center-p">
              该邮件由您的Typecho博客<a href="http://blog.52react.cn/"
                >JeremyChan博客</a
              >使用的插件AutoBackup发出<br />如果你没有做相关设置，<a
                data-auto-link="1"
                href="mailto:%E8%AF%B7%E8%81%94%E7%B3%BB%E9%82%AE%E4%BB%B6%E6%9D%A5%E6%BA%90%E5%9C%B0%E5%9D%80jerrychen_23@126.com"
                >请联系邮件来源地址jerrychen_23@126.com</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
    <script></script>
  </body>
</html>
`; //发送的内容


let transport = nodemailer.createTransport(
  smtpTransport({
    host: 'smtp.126.com',
    port: 465,
    secure: true,
    auth: {
      user: 'jerrychen_23@126.com', //你真实的邮箱
      pass: 'ZLHJILIGBCZYTVDR', //真实的密码
    },
  })
);


//todo:查找文件


function sendMail(call) {
  // 发送的配置项
  let mailOptions = {
    from: 'jerrychen_23@126.com',
    to: to,
    subject: subject,
    html: html,
    attachments: [
      //附件
      {
        filename: 'textfile.txt',
        path: '/Users/lovewcc/Documents/Study/04-NODEJS/koa2-manger-server/logs/all-logs.log',
      },
    ],
  };
  //发送函数
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      call(false);
    } else {
      call(true); //因为是异步 所有需要回调函数通知成功结果
    }
  });
}

module.exports = {
  sendMail,
};
