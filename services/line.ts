import * as _ from 'lodash'
import { Config } from "./config";
import * as line from '@line/bot-sdk';

export class LineService {
    config: Config
    
    constructor(config: Config) {
        this.config = config
    }

    get isEnable(): boolean {
        return !(_.isEmpty(this.config.lineSecretKey) || _.isEmpty(this.config.lineAccessToken))
    }

    validateSignature(signature: string, payload: string): boolean {
        return line.validateSignature(payload, this.config.lineSecretKey, signature)
    }

    async handleEvents(events: line.WebhookEvent[]) {
        const handlers = _.map(events, this.handleEvent)
        await Promise.all(handlers)
    }

    private async handleEvent(event: line.WebhookEvent) {
        console.log(`LINE Event: ${event.type}`)
    }
}