/*
 * @Author: MarioGo
 * @Date: 2021-08-22 16:49:34
 * @LastEditTime: 2021-08-23 22:58:58
 * @LastEditors: MarioGo
 * @Description: 休假申请接口
 * @FilePath: /manager-server/server/routes/leave.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

const { controller, get, post, put } = require('../lib/decorator');
const Leave = require('../models/leaveSchema');
const Utils = require('../utils/util');
const Dept = require('../models/deptSchema');

@controller('/api/leave')
export class leaveController {
  @get('/noticeCount')
  async getNoticeCount(ctx) {
    ctx.body = Utils.success({});
  }
  // 查询申请列表
  @get('/leaveList')
  async getLeaveListt(ctx) {
    const { applyState } = ctx.request.query;
    const { page, skipIndex } = Utils.pager(ctx.request.query);
    let authorization = ctx.request.headers.authorization;
    let { data } = Utils.decoded(authorization);
    try {
      let params = {
        'applyUser.userId': data.userId,
      };
      //传过来的是字符串 必须转 数字
      if (Number(applyState)) params.applyState = applyState;
      const query = Leave.find(params); //promise对象

      // 查找第几页后10条数据
      const list = await query.skip(skipIndex).limit(page.pageSize);
      //获取 某某 对应多少条
      const total = await Leave.countDocuments(params);
      ctx.body = Utils.success({
        list,
        page: {
          ...page,
          total,
        },
      });
    } catch (error) {
      ctx.body = Utils.fail(`查询失败:${error.stack}`);
    }
  }

  // 部门操作创建 编辑 删除
  @post('/leaveOperate')
  async leaveOperate(ctx, next) {
    const { _id, action, ...params } = ctx.request.body;
    let authorization = ctx.request.headers.authorization;
    let { data } = Utils.decoded(authorization);
    let res, info;
    try {
      if (action === 'create') {
        //申请单号
        let orderNo = 'XJ';
        orderNo += Utils.formateDate(new Date(), 'yyyyMMdd');
        const total = await Leave.countDocuments();
        params.orderNo = orderNo + total;

        //获取上级部门负责人信息
        let id = data.deptId.pop(); //获取部门id
        //查找负责人信息
        let dept = await Dept.findById(id);
        // 获取人事部门和财务部门负责人信息
        let userList = await Dept.find({
          deptName: { $in: ['人事部门', '财务部门'] },
        });
        // 当前审批人
        let curAuditUserName = dept.userName;
        //获取审批流
        let auditFlows = [
          {
            userId: dept.userId,
            userName: dept.userName,
            userEmail: dept.userEmail,
          },
        ];
        let auditUsers = dept.userName;
        userList.map((item) => {
          auditFlows.push({
            userId: item.userId,
            userName: item.userName,
            userEmail: item.userEmail,
          });
          auditUsers += ',' + item.userName;
        });

        params.auditUsers = auditUsers;
        params.curAuditUserName = curAuditUserName;
        params.auditFlows = auditFlows;
        params.auditLogs = [];
        params.applyUser = {
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
        };

        res = await Leave.create({ ...params });
        info = '创建成功';
      } else if (action === 'edit') {
        //查看 修改状态
        if (_id) {
          params.updateTime = new Date();
          await Dept.findByIdAndUpdate(_id, params);
          info = '更新成功';
        } else {
          ctx.body = Utils.fail(`缺少参数:_id`);
        }
      } else if (action === 'delete') {
        //作废处理
        await Leave.findByIdAndUpdate(_id, { applyState: 5 });
        info = '操作成功';
      }
      ctx.body = Utils.success(res, info);
    } catch (error) {
      ctx.body = Utils.fail(`编辑失败:${error.stack}`);
    }
  }
}
