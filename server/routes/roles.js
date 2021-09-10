/**
 * 角色操作 创建 编辑 删除
 */
const {controller, get, post, put} = require('../lib/decorator');
const Role = require('../models/roleSchema');
const Utils = require('../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

@controller('/api/roles')
export class rolesController {
    // 创建 编辑 删除
    @post('/roleOperate')
    async editRoles(ctx, next) {
        const {_id, roleName, remark, action} = ctx.request.body
        let res, info;
        try {
            if (action === "create") {
                res = await Role.create({roleName, remark})
                info = "创建成功"
            } else if (action === "edit") {
                if (_id) {
                    let params = {roleName, remark}
                    params.updateTime = new Date()
                    res = await Role.findByIdAndUpdate(_id, {roleName, remark})
                    info = "更新成功"
                } else {
                    ctx.body = Utils.fail(`缺少参数:_id`);
                }
            } else if (action === "delete") {
                if (_id) {
                    res = await Role.findByIdAndDelete(_id)
                    info = "删除成功"
                } else {
                    ctx.body = Utils.fail(`缺少参数:_id`);
                }
            }
            ctx.body = Utils.success(res, info)
        } catch (error) {
            ctx.body = Utils.fail(`编辑失败:${error.stack}`);
        }

    }

    // 按页获取角色列表
    @get('/roleList')
    async getRoleList(ctx) {
        const {roleName} = ctx.request.query
        const {page, skipIndex} = Utils.pager(ctx.request.query)
        try {
            let params = {}
            if (roleName) params.roleName = roleName
            const query = Role.find(params)  //promise对象
            // 查找第几页后10条数据
            const list = await query.skip(skipIndex).limit(page.pageSize)
            //获取 某某 对应多少条
            const total = await Role.countDocuments(params)
            ctx.body = Utils.success({
                list,
                page: {
                    ...page,
                    total
                }
            })
        } catch (error) {
            ctx.body = Utils.fail(`查询失败:${error.stack}`);
        }
    }

    @get('/RoleAllList')
    async getRolesAllList(ctx) {
        try {
            //查询结果
            const list = await Role.find({}, '_id roleName');
            ctx.body = Utils.success(list);
        } catch (error) {
            ctx.body = Utils.fail(`查询失败:${error.stack}`);
        }
    }

    @post('/updatePermission')
    async updatePermission(ctx) {
        const {_id, permissionList} = ctx.request.body
        try {
            let params = {permissionList, update: new Date()}
            await Role.findByIdAndUpdate(_id, params)
            ctx.body = Utils.success('', '权限设置成功')
        } catch (error) {
            ctx.body = Utils.fail('权限设置失败')
        }
    }


}
