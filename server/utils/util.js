/*
 * @Author: MarioGo
 * @Date: 2021-07-28 23:48:49
 * @LastEditTime: 2021-08-23 22:40:42
 * @LastEditors: MarioGo
 * @Description: 文件描述
 * @FilePath: /manager-server/server/utils/util.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
/**
 * 通用工具函数
 */
const log4js = require('./log4j');
const jwt = require('jsonwebtoken');
const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, // 参数错误
  USER_ACCOUNT_ERROR: 20001, //账号或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, //业务请求失败
  AUTH_ERROR: 500001, // 认证失败或TOKEN过期
};
module.exports = {
  /**
   * 分页结构封装
   * @param {number} pageNum
   * @param {number} pageSize
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1;
    pageSize *= 1;
    //  当前序列 第一页是0  第二页则是1 以此类推
    const skipIndex = (pageNum - 1) * pageSize;
    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    };
  },
  success(data = '', msg = '', code = CODE.SUCCESS) {
    log4js.debug(data);
    return {
      code,
      data,
      msg,
    };
  },
  fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
    log4js.debug(msg);
    return {
      code,
      data,
      msg,
    };
  },
  CODE,
  decoded(authorization) {
    if (authorization) {
      let token = authorization.split(' ')[1];
      return jwt.verify(token, 'imooc');
    }
    return '';
  },
  // 递归拼接树形列表
  getTreeMenu(rootList, id, list) {
    // 遍历一级菜单
    for (let i = 0; i < rootList.length; i++) {
      let item = rootList[i];
      if (String(item.parentId.slice().pop()) == String(id)) {
        list.push(item._doc);
      }
    }
    // 遍历二级菜单
    list.map((item) => {
      item.children = [];
      this.getTreeMenu(rootList, item._id, item.children);
      if (item.children.length == 0) {
        delete item.children;
      } else if (item.children.length > 0 && item.children[0].menuType == 2) {
        // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
        item.action = item.children;
      }
    });
    return list;
  },
  // 日期格式化
  formateDate(date, rule) {
    let fmt = rule || 'yyyy-MM-dd hh:mm:ss';
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, date.getFullYear());
    }
    const o = {
      // 'y+': date.getFullYear(),
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
    };
    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        const val = o[k] + '';
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length)
        );
      }
    }
    return fmt;
  },
};
