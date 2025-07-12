import fs from "fs";
const dirpath = "plugins/trss-akasha-terminal-plugin/data"
const QQYpath = "plugins/trss-akasha-terminal-plugin/data/qylp"
const QQYhomepath = "plugins/trss-akasha-terminal-plugin/data/qylp/UserHome"
const QQYincapath = "plugins/trss-akasha-terminal-plugin/data/qylp/UserYinPa"
const QQYplacepath = "plugins/trss-akasha-terminal-plugin/data/qylp/UserPlace"
const QQYhousepath = "plugins/trss-akasha-terminal-plugin/data/qylp/UserHouse"
//这两个函数都是用来读取和保存json数据的
async function getUser(id, json, Template, filename, is_save) {
    /*if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
        filename = filename + ".json";//添加.json
    }*/
    if (!is_save) {
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            json[id] = Template
        }
        return json;
    }
    else {
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
async function getUser2(user_id, json, dirname, is_save) {
    if (is_save) {
        let filename = `${user_id}.json`;
        fs.writeFileSync(dirpath + `/${dirname}/` + filename, JSON.stringify(json, null, "\t"));
    }
    else {
        let filename = `${user_id}.json`;
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        //如果文件不存在，创建文件
        if (!fs.existsSync(dirpath + `/${dirname}/` + filename)) {
            fs.writeFileSync(dirpath + `/${dirname}/` + filename, JSON.stringify({
            }));
        }
        //读取文件
        var json = JSON.parse(fs.readFileSync(dirpath + `/${dirname}/` + filename, "utf8"));
        return json
    }
}
async function getQQYUserBattle(id, json, is_save) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[getQQYUserBattle] 无效的用户ID: ${id}`);
        return {};
    }
    
    if (!is_save) {
        var battlefilename = `battle.json`;//文件名
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + battlefilename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + battlefilename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + battlefilename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            var battleTemplate = {//创建该用户
                "experience": 0,
                "level": 0,
                "levelname": '无等级',
                "Privilege": 0,
            };
            json[id] = battleTemplate
            fs.writeFileSync(dirpath + "/" + battlefilename, JSON.stringify(json, null, "\t"));//写入文件
        }
        return json;
    }
    else {
        fs.writeFileSync(dirpath + "/" + battlefilename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
async function getQQYUserPlace(id, json, filename, is_save) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[getQQYUserPlace] 无效的用户ID: ${id}`);
        return {};
    }
    
    if (!is_save) {
        if (!fs.existsSync(QQYpath)) {//如果文件夹不存在
            fs.mkdirSync(QQYpath);//创建文件夹
        }
        if (!fs.existsSync(QQYplacepath)) {//如果文件夹不存在
            fs.mkdirSync(QQYplacepath);//创建文件夹
        }
        if (!fs.existsSync(QQYplacepath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(QQYplacepath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(QQYplacepath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            let place_template = {
                "place": "home",
                "placetime": 0
            }
            json[id] = place_template
            fs.writeFileSync(QQYplacepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        }
        return json;
    }
    else {
        fs.writeFileSync(QQYplacepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
async function getQQYUserxiaoqie(id, json, filename, is_save){
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[getQQYUserxiaoqie] 无效的用户ID: ${id}`);
        return {};
    }
    
    if (!is_save) {
        if (!fs.existsSync(QQYpath)) {//如果文件夹不存在
            fs.mkdirSync(QQYpath);//创建文件夹
        }
        if (!fs.existsSync(QQYincapath)) {//如果文件夹不存在
            fs.mkdirSync(QQYincapath);//创建文件夹
        }
        if (!fs.existsSync(QQYincapath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(QQYincapath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(QQYincapath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            let place_template = {
                "fuck": [],
                "fucktime": 0,
                "kun": 0
            }
            json[id] = place_template
            fs.writeFileSync(QQYincapath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        }
        return json;
    }
    else {
        fs.writeFileSync(QQYincapath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
async function getQQYUserHome(id, json, filename, is_save) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[getQQYUserHome] 无效的用户ID: ${id}`);
        return {};
    }
    if (!is_save) {
        if (!fs.existsSync(QQYpath)) {//如果文件夹不存在
            fs.mkdirSync(QQYpath);//创建文件夹
        }
        if (!fs.existsSync(QQYhomepath)) {//如果文件夹不存在
            fs.mkdirSync(QQYhomepath);//创建文件夹
        }
        if (!fs.existsSync(QQYhomepath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(QQYhomepath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(QQYhomepath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            let home_template = {
                "s": 0,
                "wait": 0,
                "money": 100,
                "love": 0
            }
            json[id] = home_template
        }
        fs.writeFileSync(QQYhomepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        // 转出10进制
        if (json[id].money2) {
            json[id].money10 = parseInt(json[id].money2, 2)
            if (json[id].money > json[id].money10) { json[id].money = json[id].money10 }
            else { json[id].money10 = json[id].money }
        }
        if (json[id].love2) {
            json[id].love10 = parseInt(json[id].love2, 2)
            if (json[id].love > json[id].love10) { json[id].love = json[id].love10 }
            else { json[id].love10 = json[id].love }
        }
        return json;
    }
    else {
        // 写入二进制
        json[id].money2 = json[id].money.toString(2)
        json[id].love2 = json[id].love.toString(2)
        fs.writeFileSync(QQYhomepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
async function getQQYUserHouse(id, json, filename, is_save) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[getQQYUserHouse] 无效的用户ID: ${id}`);
        return {};
    }
    
    if (!is_save) {
        if (!fs.existsSync(QQYpath)) {//如果文件夹不存在
            fs.mkdirSync(QQYpath);//创建文件夹
        }
        if (!fs.existsSync(QQYhousepath)) {//如果文件夹不存在
            fs.mkdirSync(QQYhousepath);//创建文件夹
        }
        if (!fs.existsSync(QQYhousepath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(QQYhousepath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(QQYhousepath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(id)) {//如果json中不存在该用户
            let house_template = {
                "name": "小破屋",
                "space": 6,
                "price": 500,
                "loveup": 1
            }
            json[id] = house_template
            fs.writeFileSync(QQYhousepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        }
        return json;
    }
    else {
        fs.writeFileSync(QQYhousepath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return json;
    }
}
// 保存方法。这样应该会没问题把，大概
async function saveQQYUserBattle(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveQQYUserBattle] 无效的用户ID: ${id}`);
        return json;
    }
    const filename = 'default.json'
    return await getQQYUserBattle(id, json, filename, true)
}

async function saveQQYUserHome(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveQQYUserHome] 无效的用户ID: ${id}`);
        return json;
    }
    const filename = 'default.json'
    return await getQQYUserHome(id, json, filename, true)
}

async function saveQQYUserPlace(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveQQYUserPlace] 无效的用户ID: ${id}`);
        return json;
    }
    const filename = 'default.json'
    return await getQQYUserPlace(id, json, filename, true)
}

async function saveQQYUserHouse(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveQQYUserHouse] 无效的用户ID: ${id}`);
        return json;
    }
    const filename = 'default.json'
    return await getQQYUserHouse(id, json, filename, true)
}

async function saveQQYUserxiaoqie(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveQQYUserxiaoqie] 无效的用户ID: ${id}`);
        return json;
    }
    const filename = 'default.json'
    return await getQQYUserxiaoqie(id, json, filename, true)
}

async function saveUser(id, json) {
    // 验证用户ID的有效性
    if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
        (typeof id === 'string' && id.length < 5)) {
        console.warn(`[saveUser] 无效的用户ID: ${id}`);
        return json;
    }
    const Template = {}
    const filename = 'default.json'
    return await getUser(id, json, Template, filename, true)
}

export default { 
    getUser, 
    getQQYUserBattle, 
    getQQYUserPlace, 
    getQQYUserxiaoqie, 
    getQQYUserHome, 
    getQQYUserHouse, 
    getUser2,
    saveQQYUserBattle,
    saveQQYUserHome,
    saveQQYUserPlace,
    saveQQYUserHouse,
    saveQQYUserxiaoqie,
    saveUser
}