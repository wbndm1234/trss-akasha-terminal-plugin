import fs from 'node:fs'
import YAML from 'yaml'
import { __dirname } from '../../../main.js'
/**配置地址,可自行更改*/
const __diryaml = `${__dirname}/config/parameter/cooling.yaml`
class DefsetUpdata {
    /**
     * @param { app, name } param0 
     * @returns 
     */
    getConfig = ({ app, name }) => {
        //获得配置地址
        const file = `${__dirname}/config/${app}/${name}.yaml`
        //读取配置
        const data = YAML.parse(fs.readFileSync(file, 'utf8'))
        return data
    }
    /**
     * @param { name, size } param0 
     * @returns 
     */
    updataConfig = ({ name, size }) => {
        const map = {
            '撤回时间': 'timeout.size',
        }
        if (map.hasOwnProperty(name)) {
            const [name0, name1] = map[name].split('.')
            const data = YAML.parse(fs.readFileSync(`${__diryaml}`, 'utf8'))
            data[name0][name1] = Number(size)
            const yamlStr = YAML.stringify(data)
            fs.writeFileSync(`${__diryaml}`, yamlStr, 'utf8')
            return `修改${name}为${size}`
        } else {
            return '无次项配置信息'
        }
    }
}
export default new DefsetUpdata()