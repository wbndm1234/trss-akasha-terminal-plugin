import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import YAML from 'yaml'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginRoot = path.resolve(__dirname, '..')

export const _paths = {
  pluginRoot,
  configPath: path.join(pluginRoot, 'config'),
  resourcesPath: path.join(pluginRoot, 'resources'),
  dataPath: path.join(pluginRoot, 'data')
}

// 加载配置数据
function loadConfig() {
  try {
    const cooldownConfigPath = path.join(_paths.configPath, 'cooldown_config.yaml')
    if (fs.existsSync(cooldownConfigPath)) {
      const yamlContent = fs.readFileSync(cooldownConfigPath, 'utf8')
      return YAML.parse(yamlContent) || {}
    }
  } catch (error) {
    console.error('加载配置文件失败:', error)
  }
  return {}
}

// 保存配置数据
function saveConfig(data) {
  try {
    const cooldownConfigPath = path.join(_paths.configPath, 'cooldown_config.yaml')
    const yamlContent = YAML.stringify(data)
    fs.writeFileSync(cooldownConfigPath, yamlContent, 'utf8')
    return true
  } catch (error) {
    console.error('保存配置文件失败:', error)
    return false
  }
}

export const cfg = {
  // 合并后的配置数据
  merged: loadConfig(),
  
  // 配置对象
  config: {
    reader: {
      setData: (data) => {
        if (saveConfig(data)) {
          cfg.merged = data
          console.log('配置数据已成功保存')
        } else {
          console.error('配置数据保存失败')
        }
      }
    }
  },
  
  // 获取配置值
  get: (keyPath, defaultValue) => {
    const keys = keyPath.split('.')
    let value = cfg.merged
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return defaultValue
      }
    }
    return value
  },
  
  // 获取配置文件路径
  getConfigPath: (filename) => {
    return path.join(_paths.configPath, filename)
  },
  
  // 获取资源文件路径
  getResourcePath: (filename) => {
    return path.join(_paths.resourcesPath, filename)
  },
  
  // 获取数据文件路径
  getDataPath: (filename) => {
    return path.join(_paths.dataPath, filename)
  }
}

// 导出
export default {
  _paths,
  cfg
}