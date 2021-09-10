
/**
 * 角色操作 创建 编辑 删除
 */
const {controller, get, post, put} = require('../lib/decorator');
const Dept = require('../models/deptSchema');
const Utils = require('../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

@controller('/api/dept')
export class rolesController {
    // 部门列表列表
    @get('/deptList')
    async getRoleList(ctx) {
        const {deptName} = ctx.request.query
        try {
            let params = {}
            if (deptName) params.deptName = deptName
            //递归
            const rootList = await Dept.find(params)  //promise对象
            if (deptName) {
                ctx.body = Utils.success(rootList)
            } else {
               let treeList =  getTreeDept(rootList, null,[])
                ctx.body = Utils.success(treeList)
            }
        } catch (error) {
            ctx.body = Utils.fail(`查询失败:${error.stack}`);
        }
    }

    // 部门操作创建 编辑 删除
    @post('/deptOperate')
    async editRoles(ctx, next) {
        const {_id, action, ...params} = ctx.request.body
        let res, info;
        try {
            if (action === "create") {
                res = await Dept.create({...params})
                info = "创建成功"
            } else if (action === "edit") {
                if (_id) {
                    params.updateTime = new Date()
                    await Dept.findByIdAndUpdate(_id, params)
                    info = "更新成功"
                } else {
                    ctx.body = Utils.fail(`缺少参数:_id`);
                }
            } else if (action === "delete") {
                if (_id) {
                    //删除对应id列表
                    await Dept.findByIdAndRemove(_id)
                    //查找所有对应次id的
                    await Dept.deleteMany(
                        {parentId: {$all: [_id]}});
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


// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
    // 遍历一级菜单
    for (let i = 0; i < rootList.length; i++) {
        let item = rootList[i]
        if (String(item.parentId.slice().pop()) == String(id)) {
            list.push(item._doc)
        }
    }
    // 遍历二级菜单
    list.map(item => {
        item.children = []
        getTreeDept(rootList, item._id, item.children)
        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return list;
}
