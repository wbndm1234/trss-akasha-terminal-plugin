import fs from 'node:fs'
import YAML from 'yaml'

const _defpath = `./plugins/trss-akasha-terminal-plugin/config/akasha.config.def.yaml`;

const configyamlpath = `./plugins/trss-akasha-terminal-plugin/config/akasha.config.yaml`;

const resourcespath = `./plugins/trss-akasha-terminal-plugin/resources/akasha.resources.yaml`;

const _path = process.cwd().replace(/\\/g, '/');

if (!fs.existsSync(configyamlpath)) {//如果配置不存在，则复制一份默认配置到配置里面
    fs.copyFileSync(`${_defpath}`, `${configyamlpath}`);
}

async function getConfig(name, key) {//获取

    let config = YAML.parse(fs.readFileSync(configyamlpath, 'utf8'));

    if (!config[name][key]) {
        logger.error(`没有设置[${name}]:[${key}],请使用“#虚空重置配置”指令或者前往[${configyamlpath}]设置！`);
    }
    return config[name][key];

}
async function getresources(name, key) {//获取

    let resources = YAML.parse(fs.readFileSync(resourcespath, 'utf8'));

    if (!resources[name][key]) {
        logger.error(`没有设置[${name}]:[${key}],请使用“#虚空重置配置”指令或者前往[${resourcespath}]设置！`);
    }
    return resources[name][key];

}


export default { getConfig ,getresources}
