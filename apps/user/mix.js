import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
export class MIX extends plugin {
    constructor() {
        super({
            name: '娶群友',
            dsc: '娶群友',
            event: 'message',
            priority: 66,
            rule: [{
                reg: "^#?虚空合成台$",
                fnc: 'mixbox'
            },
            ]
        })
    }
    async mixbox(e){
        var data = {
            file: './plugins/trss-akasha-terminal-plugin/resources/qylp/mix.html'
        }
        var img = await puppeteer.screenshot("mixbox", {
            ...data
        })
        e.reply(img)
    }
}