/*
 * @Author: MarioGo
 * @Date: 2021-08-04 22:38:31
 * @LastEditTime: 2021-08-23 23:01:10
 * @LastEditors: MarioGo
 * @Description: 文件描述
 * @FilePath: /manager-server/server/routes/menus.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
const {controller, get, post, put} = require('../lib/decorator');
const Menu = require('../models/menuSchema');
const Utils = require('../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

@controller('/api/menu')
export class menuController {
    @post('/menuOperate')
    async setMenus(ctx, next) {
        const {_id, action, ...params} = ctx.request.body;
        //创建
        let info, res;
        try {
            if (action === 'add') {
                res = await Menu.create(params);
                info = '创建成功';
            } else if (action === 'edit') {
                params.updateTime = new Date();
                res = await Menu.findByIdAndUpdate(_id, params);
                info = '编辑成功';
            } else {
                res = await Menu.findByIdAndRemove(_id);
                //子数据中全部删除
                await Menu.deleteMany({parentId: {$all: [_id]}});
                info = '删除成功';
            }
            ctx.body = Utils.success('', info);
        } catch (error) {
            console.log('error :>> ', error);
            ctx.body = Utils.fail(error.stack);
        }
    }

    @get('/menuList')
    async getMenus(ctx, next) {
        //查询参数
        const {menuName, menuState} = ctx.request.query;
        const params = {};

        if (menuName) params.menuName = menuName;
        if (menuState) params.menuState = menuState;
        let rootList = (await Menu.find(params)) || [];
        const permissionList = Utils.getTreeMenu(rootList, null, []);
        ctx.body = Utils.success(permissionList);
    }
}

