import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { Component, OnInit, OnDestroy }     from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { Bot }        from '../bot'
import { BotService } from '../bot.service'

import { Message } from '../../api/message'

@Component({
    templateUrl: 'bot-inbox.component.html',
    styles: [`
        strong { color: red; }
        th { text-align: left; }
        td, th { padding: 5px; }
        td { vertical-align: top; }
        tr:nth-child(odd) { background-color: whitesmoke; }
    `]
})
export class BotInboxComponent implements OnInit, OnDestroy {
    bot: Bot
    interval: number = 1000
    updater: Subscription
    lastUpdates: number
    
    fileIds: Map<string, string> = new Map()

    constructor(
        private service: BotService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    createUpdater() {
        this.destroyUpdater()
        this.updater = Observable
            .timer(0, this.interval)
            .concatMap(() => this.getMessages())
            .subscribe()
    }

    destroyUpdater() {
        if (this.updater) {
            this.updater.unsubscribe()
            this.updater = null
        }
    }

    ngOnInit() {
        const botFinder = async params => this.service.find(params.get('token'))
        const botCallback = async (bot: Bot) => {
            if (!bot) return this.router.navigate(['/bots'])

            this.bot = bot
            this.createUpdater()
        }

        this.route.paramMap
            .switchMap(botFinder)
            .subscribe(botCallback)
    }

    ngOnDestroy() {
        this.destroyUpdater()
    }

    async getMessages() {
        const updates = await this.bot.getFullUpdates()
        this.lastUpdates = updates.length
    }

    getFile({ file_id }) {
        if (!this.fileIds.has(file_id)) this.bot.getFile(file_id).then(file =>
            this.fileIds.set(file_id, this.bot.fileBase + '/' + file.file_path))

        return this.fileIds.get(file_id)
    }
}