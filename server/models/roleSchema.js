/**
 * 角色表
 */
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  roleName: String,
  remark: String,
  permissionList: {
    checkedKeys: [],
    halfCheckedKeys: [],
  },
  createTime: {
    type: Date,
    default: Date.now(),
  }, //创建时间
  updateTime: {
    type: Date,
    default: Date.now(),
  }, //创建时间
});

module.exports = mongoose.model('roles', userSchema, 'roles');
