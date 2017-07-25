import 'rxjs/add/operator/switchMap'

import { Component, OnInit }                from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { Bot }        from '../bot'
import { BotService } from '../bot.service'

import { Message } from '../../api/message'

@Component({
    templateUrl: 'bot-inbox.component.html'
})
export class BotInboxComponent implements OnInit {
    bot: Bot
    messages: Message[]

    constructor(
        private service: BotService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        const botFinder = async ({ get }) => this.service.find(+get('id'))

        const botCallback = (bot: Bot) => (this.bot = bot)
            .getFullUpdates()
            .then(updates => this.messages = updates
            .filter(update => update.message && update.message.text)
            .map(update => update.message))

        this.route.paramMap
            .switchMap(botFinder)
            .subscribe(botCallback)
    }
}