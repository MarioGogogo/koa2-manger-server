/*
 * @Author: MarioGo
 * @Date: 2021-09-10 20:05:52
 * @LastEditTime: 2021-09-10 20:07:38
 * @LastEditors: MarioGo
 * @Description: fileSchema表
 * @FilePath: /manager-server/server/models/fileSchema.js
 * 可以输入预定的版权声明、个性签名、空行等
 */
/**
 * 部门表结构
 */
const mongoose = require('mongoose')
const fileSchema = mongoose.Schema({
    appName:String,
    appVersion:String,
    appMd5:String,
    updateTime:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("files", fileSchema, "files")