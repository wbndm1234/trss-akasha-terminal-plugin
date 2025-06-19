import fs from 'node:fs'
import { __dirname } from '../../main.js'
import algorithm from './algorithm.js'
/**自定义配置文件*/
const configarr = ['cooling.yaml', 'task.yaml', 'help.yaml', 'admin.yaml']
class CreateData {
  constructor() {
    /*固定配置地址*/
    this.defsetpath = `${__dirname}/resources/defset/`
    /*动态配置地址*/
    this.configpath = `${__dirname}/config/`
  }
  /**
   * @param { choice } parameter 
   * @returns 
   */
  moveConfig = ({ choice }) => {
    const path = algorithm.returnMenu(this.defsetpath)
    path.forEach((itempath) => {
      configarr.forEach((itemconfig) => {
        let x = `${this.configpath}${itempath}/${itemconfig}`
        let y = `${this.defsetpath}${itempath}/${itemconfig}`
        //刷新控制
        if (choice) {
          //存在就复制,需要替换原文件,已达到更新的目的
          if (fs.existsSync(y)) {
            fs.cp(y, x, (err) => {
              if (err) { }
            })
          }
        } else {
          //不存在就复制
          if (!fs.existsSync(x)) {
            fs.cp(y, x, (err) => {
              if (err) { }
            })
          }
        }
      })
    })
    return
  }
  /*复制两个文件*/
  generateImg = ({ path, name }) => {
    path.forEach((itempath) => {
      name.forEach((itemname) => {
        /**路径位置可自行更改*/
        let x = `${__dirname}/resources/img/${itempath}/${itemname}`
        if (!fs.existsSync(x)) {
          let y = `${__dirname}/resources/html/allimg/${itempath}/${itemname}`
          fs.cp(y, x,
            (err) => {
              if (err) { }
            })
        }
      })
    })
    return
  }
  /**
   * 循环创建指定目录
   * @param {*} arr 
   * @returns 
   */
  generateDirectory = (arr) => {
    for (let item in arr) {
      if (!fs.existsSync(item)) {
        fs.mkdir(item, (err) => { })
      }
    }
    return true
  }
}
export default new CreateData()