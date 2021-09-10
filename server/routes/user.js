import {tryCatch} from 'ramda';

const {controller, get, post, put} = require('../lib/decorator');
const User = require('../models/userSchema');
const Utils = require('../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const Counter = require('./../models/counterSchema');
const Menu = require('../models/menuSchema');
const Role = require('../models/roleSchema');

@controller('/api/users')
export class userController {
    @post('/usersOperate')
    async addUser(ctx, next) {
        const {
            userId,
            userName,
            userEmail,
            mobile,
            job,
            state,
            roleList,
            deptId,
            action,
        } = ctx.request.body;
        //效验规则
        if (!userName || !userEmail || !deptId) {
            ctx.body = Utils.fail('参数错误', Utils.CODE.PARAM_ERROR);
            return;
        }
        //查询是否存在数据
        const res = await User.findOne(
            {$or: [{userName}, {userEmail}]},
            '_id userName userEmail'
        );
        //创建用户
        if (action == 'add') {
            if (res) {
                ctx.body = Utils.fail(
                    `系统监测到有重复的用户，信息如下：${res.userName} - ${res.userEmail}`
                );
            } else {
                //维护自增加的表 +1
                const doc = await Counter.findOneAndUpdate(
                    {_id: 'userId'},
                    {$inc: {sequence_value: 1}},
                    {new: true}
                );
                console.log(
                    '%c 🥖 doc: ',
                    'font-size:20px;background-color: #4b4b4b;color:#fff;',
                    doc
                );
                try {
                    const user = new User({
                        userId: doc.sequence_value,
                        userName,
                        userPwd: md5('123456'), //初始密码
                        userEmail,
                        role: 1, //默认普通用户  0 是管理员
                        roleList,
                        job,
                        state,
                        deptId,
                        mobile,
                    });
                    //存数据库
                    user.save();
                    ctx.body = Utils.success('', '用户创建成功');
                } catch (error) {
                    ctx.body = Utils.fail(error.stack, '用户创建失败');
                }
            }
        } else {
            if (!deptId) {
                ctx.body = Utils.fail('部门不能为空', Utils.CODE.PARAM_ERROR);
                return;
            }
            try {
                //todo:这里可能有bug 无法更新
                const res = await User.updateMany(
                    {userId: {$in: userId}},
                    { mobile, job, state, roleList, deptId}
                );
               // const res = await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId, })
                ctx.body = Utils.success({}, '更新成功')
            } catch (error) {
                ctx.body = Utils.fail(error.stack, '更新失败');
            }
        }
    }

    @get('/userList')
    async getList(ctx, next) {
        //参数 因为是get请求所有是query
        const {userId, userName, state} = ctx.request.query;
        //获取分页信息
        const {page, skipIndex} = Utils.pager(ctx.request.query);
        let params = {};
        //有参数则赋值 加入查询条件
        if (userId) params.userId = userId;
        if (userName) params.userName = userName;
        if (state && state != '0') params.state = state;
        try {
            // 根据条件查询所有用户列表   排除这些字段不需要返回 { _id: 0, userPwd: 0 }
            const query = User.find(params, {_id: 0, userPwd: 0});
            //查询第几条到第几条之前的数据返回
            const list = await query.skip(skipIndex).limit(page.pageSize);
            //计算总数
            const total = await User.countDocuments(params);

            ctx.body = Utils.success({
                page: {
                    ...page,
                    total,
                },
                list,
            });
        } catch (error) {
            ctx.body = Utils.fail(`查询异常:${error.stack}`);
        }
    }

    @get('/allUserList')
    async getAllUserList(ctx) {
        try {
            const list = await User.find({}, 'userId userName userEmail');
            ctx.body = Utils.success(list);
        } catch (error) {
            ctx.body = Utils.fail(`查询异常:${error.stack}`);
        }
    }

    //获取用户相关权限菜单
    @get('/permissionList')
    async getPermissionList(ctx) {
        let authorization = ctx.request.headers.authorization;
        let {data} = Utils.decoded(authorization);
        let menuList = await getMenuList(data.role, data.roleList);
        //按钮列表
        let actionList = getAction(JSON.parse(JSON.stringify(menuList)));
        ctx.body = Utils.success({menuList, actionList});
    }

    //删除用户
    @post('/userDelete')
    async deleteUser(ctx, next) {
        // 待删除的用户Id数组
        const {userIds} = ctx.request.body;
        // User.updateMany({ $or: [{ userId: 10001 }, { userId: 10002 }] })
        // 这里使用软删除 === 改变 用户状态离职 来达到删除目的
        const res = await User.updateMany(
            {userId: {$in: userIds}},
            {state: 2}
        );
        //{n: 1, nModified: 1, ok: 1}
        if (res.nModified || res.ok) {
            ctx.body = Utils.success(res, `共删除成功${res.nModified}条`);
            return;
        }
        ctx.body = Utils.fail('删除失败');
    }
}

// 组合权限菜单
async function getMenuList(userRole, roleKeys) {
    let rootList = [];
    //说明权限是管理员
    if (userRole == 0) {
        rootList = (await Menu.find({})) || [];
    } else {
        //根据用户角色 获取权限列表
        // 查找用户对应角色有哪些
        rootList = await Role.find({_id: {$in: roleKeys}});
        let permissionList = [];
        rootList.map((role) => {
            let {checkedKeys, halfCheckedKeys} = role.permissionList;
            permissionList = permissionList.concat([
                ...checkedKeys,
                ...halfCheckedKeys,
            ]);
        });
        //去重
        permissionList = [...new Set(permissionList)];
        // 角色对应的权限列表
        rootList = await Menu.find({_id: {$in: permissionList}});
    }
    return Utils.getTreeMenu(rootList, null, []);
}


//按钮权限
 function getAction(list){
   const actionList = []
    const deep = (arr) => {
        while (arr.length) {
            let item = arr.pop()
            if ( item.action) {
                item.action.map(action=>{
                    actionList.push(action.menuCode)
                })
            }
            if (item.children && !item.action) {
                deep(item.children)
            }
        }
    }
     deep(list)
    console.log('actionList',actionList)
     return actionList
}
