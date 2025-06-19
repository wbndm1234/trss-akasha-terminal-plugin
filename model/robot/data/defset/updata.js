import fs from 'node:fs'
import YAML from 'yaml'
import { __dirname } from '../../../main.js'
class DefsetUpdata {
    /**
     * @param { app, name } param0 
     * @returns 
     */
    getConfig = ( { app, name }) => {
        /*获得配置地址*/
        const file = `${__dirname}/config/${app}/${name}.yaml`
        /*读取配置*/
        const data = YAML.parse(fs.readFileSync(file, 'utf8'))
        return data
    }
}
export default new DefsetUpdata()