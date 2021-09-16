/*
 * @Author: MarioGo
 * @Date: 2021-09-16 19:43:19
 * @LastEditTime: 2021-09-16 19:56:19
 * @LastEditors: MarioGo
 * @Description: 文件描述
 * @FilePath: /manager-server/server/routes/approve.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

const { controller, get, post, put } = require('../lib/decorator');
const Leave = require('../models/leaveSchema');
const Utils = require('../utils/util');

@controller('/api/approve')
export class approveController {
  // 部门操作创建 编辑 删除
  @post('/approveOperate')
  async approveOperate(ctx, next) {
    const { action, remark, _id } = ctx.request.body;
    let authorization = ctx.request.headers.authorization;
    let { data } = Utils.decoded(authorization);
    let parmams = {};
    // 1 待审核 2 审批中 3 审批拒绝 4 审批通过 5 作废
    let doc = Leave.findById(_id);
    // 拒绝
    if (action === 'refuse') {
      params.applyState = 3;
    } else {
    }
    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action === 'refuse' ? '审核拒绝' : '审核通过',
    });
    params.auditLogs = auditLogs;
    try {
      let res = await Leave.findByIdAndUpdate(_id, parmas);
      ctx.body = Utils.success('', '处理成功');
    } catch (error) {
      ctx.body = Utils.fail('查询失败');
    }
  }
}
