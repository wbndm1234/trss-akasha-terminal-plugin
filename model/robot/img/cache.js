import puppeteer from "../puppeteer/puppeteer.js"
import md5 from 'md5'
const helpData = {}
const allData = {}
/** 这是一个缓存机制用户处理图片的缓存*/
class Cache {
    /**
     * @param { data, i } param0 
     * @returns 
     */
    helpcache = async ( { data, i } ) => {
        const tmp = md5(JSON.stringify(data))
        if (!helpData.hasOwnProperty(i)) {
            helpData[i] = {
                'md5': '',
                'img': ''
            }
        }
        if (helpData[i].md5 == tmp) {
            return helpData[i].img
        }
        helpData[i].img = await puppeteer.screenshot('help', data)
        helpData[i].md5 = tmp
        return helpData[i].img
    }
    /*查看缓存*/
    readCahe = async ( { name }) => {
        if (!allData.hasOwnProperty(name)) {
            return {}
        }
        const time = new Date().getMinutes()
        if (allData[name]['time'] + 5 <= time) {
            return { CacheMSG: allData[name]['data'] }
        }
        return {}
    }
    /*添加缓存*/
    addCahe = async ({ name, data }) => {
        const time = new Date().getMinutes()
        if (!allData.hasOwnProperty(name)) {
            allData[name] = {
                'time': '',
                'data': ''
            }
        }
        allData[name]['time'] = time
        allData[name]['data'] = data
        return { CacheMSG: allData[name]['data'] }
    }
}
export default new Cache()