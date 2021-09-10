/*
 * @Author: MarioGo
 * @Date: 2021-08-22 16:37:08
 * @LastEditTime: 2021-08-22 20:22:52
 * @LastEditors: MarioGo
 * @Description: 请假数据表
 * @FilePath: /manager-server/server/models/leaveSchema.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
const mongoose = require('mongoose');
const leaveSchema = mongoose.Schema({
  orderNo: String, //单号
  applyType: Number,
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: Date.now },
  applyUser: {
    userId: String,
    userName: String,
    UserEmail: String,
  },
  leaveTime: String,
  reasons: String,
  auditUsers: String,
  curAuditUserName: String,
  auditFlows: [
    {
      userId: String,
      userName: String,
      UserEmail: String,
    },
  ],
  auditLogs: [
    {
      userId: String,
      userName: String,
      crateTime: Date,
      remark: String,
      action: String,
    },
  ],
  applyState: { type: Number, default: 1 },
  createTime: {
    type: Date,
    default: Date.now(),
  }, //创建时间
});

module.exports = mongoose.model('leaves', leaveSchema, 'leaves');
