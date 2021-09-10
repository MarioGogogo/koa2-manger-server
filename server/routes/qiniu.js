const { controller, get, post, put } = require('../lib/decorator');
const qiniu = require('qiniu');
@controller('/api/v0')
export class qiniuController {
  @get('/getToken')
  async getToken(ctx, next) {
    // accessKey，secretKey 在个人中心可以查看
    const accessKey = 'toY7J37YRhafqwU8wAqyDlK5jtEtgP3zW5GtmYV6';
    const secretKey = 'ynDwvoGnVhqpEUQWdR_6RqTxkdQnAA9C5zandR5o';
    // 鉴权对象 mac
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: 'h5monkey', // 仓库名
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(mac);
    const key = +new Date() + Math.random().toString(16).slice(2); // key 只需要随机不重复就可以
    ctx.body = { status: 1, data: { token, key } };
  }
  @get('/getList')
  async getList(ctx) {
    //获取数据量
    const limit = ctx.query.limit;
    // accessKey，secretKey 在个人中心可以查看
    const accessKey = 'toY7J37YRhafqwU8wAqyDlK5jtEtgP3zW5GtmYV6';
    const secretKey = 'ynDwvoGnVhqpEUQWdR_6RqTxkdQnAA9C5zandR5o';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    // config.useHttpsDomain = true;
    config.zone = qiniu.zone.Zone_z0;
    var bucketManager = new qiniu.rs.BucketManager(mac, config);
    var srcBucket = 'h5monkey';
    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    var options = {
      limit: limit,
    };
    if (limit == 0) return (ctx.body = { status: 1, data: [] });
    const res = await asyncGetListPrefixV2(
      bucketManager,
      srcBucket,
      options,
      limit
    );

    ctx.body = { status: 1, data: res };
  }
}

//获取全部图片
const asyncGetListPrefixV2 = async (
  bucketManager,
  srcBucket,
  options,
  limit
) => {
  return new Promise((reslove, reject) => {
    return bucketManager.listPrefixV2(
      srcBucket,
      options,
      (err, respBody, respInfo) => {
        if (err && err.res.statusCode != 200) {
          reject(err);
          throw err;
        }
        let newArr = [];
        //如果limit是1则直接返回respBody对象 否则 respBody是字符串
        if (limit == 1) {
          newArr.push(respBody.item);
          reslove(newArr);
        } else {
          //解析respBody
          const res = respBody.split('\n');
          res.forEach((item) => {
            //数组最后一位是空要去除
            if (item) {
              const arr = JSON.parse(item);
              //时间戳转换
              let newItem = arr.item;
              if (arr.item.putTime) {
                newItem = Object.assign({}, arr.item, {
                  ctime: resolutionTime(arr.item.putTime),
                });
              }
              newArr.push(newItem);
            }
          });
          reslove(newArr);
        }
      }
    );
  });
};

//时间戳转换为时间
const resolutionTime = (timestamp) => {
  timestamp = timestamp + '';
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
    timestamp = Number(timestamp);
  }
  //获取当前时间
  var now = new Date();
  //根据指定时间戳转换为时间格式
  var time = new Date();
  time.setTime(timestamp);
  //比较当前时间和指定时间的差来决定显示时间格式
  //1.年份与当前不同则显示完整日期 yyyy-MM-dd hh:mm
  if (time.getFullYear() != now.getFullYear())
    return (
      time.getFullYear() +
      '-' +
      (time.getMonth() + 1 < 10
        ? '0' + (time.getMonth() + 1)
        : time.getMonth() + 1) +
      '-' +
      (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) +
      ' ' +
      (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) +
      ':' +
      (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
    );
  //2.年份与当前相同但月份或日期不同时 显示 MM-dd hh:mm格式
  else if (time.getMonth() != now.getMonth() || time.getDate() != now.getDate())
    return (
      (time.getMonth() + 1 < 10
        ? '0' + (time.getMonth() + 1)
        : time.getMonth() + 1) +
      '-' +
      (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) +
      ' ' +
      (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) +
      ':' +
      (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
    );
  //3.年份与日期均与当前相同时，显示hh:mm格式
  else
    return (
      (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) +
      ':' +
      (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
    );
};
