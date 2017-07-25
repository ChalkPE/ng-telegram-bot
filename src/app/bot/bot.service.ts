import { Injectable }             from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'

import { Bot } from './bot'

import { User }     from '../api/user'
import { Update }   from '../api/update'
import { Response } from '../api/response'

const KEY = 'tokens'

@Injectable()
export class BotService {
    private readonly bots: Bot[]

    constructor(private http: HttpClient) {
        this.bots = []
        this.load()
    }

    private load() {
        const data = JSON.parse(localStorage.getItem(KEY));
        (data as string[] || []).forEach(token => this.register(token))
    }

    private save() {
        const data = this.bots.map(bot => bot.token)
        localStorage.setItem(KEY, JSON.stringify(data))
    }

    get(): Bot[] {
        return this.bots
    }

    find(token: string) {
        return this.bots.find(b => token === b.token)
    }

    indexOf(bot: Bot) {
        return this.bots.findIndex(b => b.id === bot.id)
    }

    add(bot: Bot) {
        const index = this.indexOf(bot)
        
        if (index < 0) this.bots.push(bot)
        else this.bots.splice(index, 1, bot)
        
        this.save()
    }

    remove(bot: Bot) {
        const index = this.indexOf(bot)
        if (index < 0) return

        this.bots.splice(index, 1)
        this.save()
    }

    register(token: string) {
        Bot.create(token, this.http)
            .then(bot => this.add(bot))
            .catch(err => alert(err))
    }
}