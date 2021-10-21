/*
 * @Author: MarioGo
 * @Date: 2021-09-16 19:43:19
 * @LastEditTime: 2021-10-02 17:00:43
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
    let params = {};
    // 1 待审核 2 审批中 3 审批拒绝 4 审批通过 5 作废
    try {
      let doc = await Leave.findById(_id);

      let auditLogs = doc.auditLogs || [];
      // 拒绝
      if (action === 'refuse') {
        params.applyState = 3;
      } else {
        // 1.当审核长度已经满了说明 全部审核了
        if (doc.auditFlows.length === doc.auditLogs.length) {
          ctx.body = Utils.success('当前申请单已处理，请勿重复提交');
          return;
        } else if (doc.auditFlows.length === doc.auditLogs.length + 1) {
          //2.优先判断如果最后一级审批人  [A,B,C]
          params.applyState = 4;
        } else if (doc.auditFlows.length > doc.auditLogs.length) {
          //审核通过 当前审核人要前进一位；
          params.applyState = 2;
          params.curAuditUserName =
            doc.auditFlows[doc.auditLogs.length + 1].userName;
        }
      }
      auditLogs.push({
        userId: data.userId,
        userName: data.userName,
        createTime: new Date(),
        remark,
        action: action === 'refuse' ? '审核拒绝' : '审核通过',
      });
      params.auditLogs = auditLogs;
      let res = await Leave.findByIdAndUpdate(_id, params);
      console.log(
        '%c 🍎 res: ',
        'font-size:20px;background-color: #FCA650;color:#fff;',
        res
      );
      ctx.body = Utils.success('', '处理成功');
    } catch (error) {
      ctx.body = Utils.fail(`查询失败:${error.message}`);
    }
  }
}
