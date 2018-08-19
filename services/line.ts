import * as _ from 'lodash'
import { Config } from "./config"
import * as line from '@line/bot-sdk'

export class LineService {
    config: Config
    
    constructor(config: Config) {
        this.config = config
    }

    get isEnable(): boolean {
        return !(_.isEmpty(this.config.lineSecretKey) || _.isEmpty(this.config.lineAccessToken))
    }

    validateSignature = (signature: string, payload: string): boolean  => {
        return line.validateSignature(payload, this.config.lineSecretKey, signature)
    }

    handleEvents = async (events: line.WebhookEvent[]) => {
        const handlers = _.map(events, this.handleEvent)
        await Promise.all(handlers)
    }

    private handleEvent = async (event: line.WebhookEvent) => {
        this.logEvent(event)
        switch (event.type) {
            case 'follow':
            case 'join':
                await this.handleFollowEvent(event)
                break
            case 'unfollow':
            case 'leave':
                await this.handleUnfollowEvent(event)
                break
            case 'join':
                break
            case 'leave':
                break
            default:
                break
        }
    }

    private handleFollowEvent = async (event: line.FollowEvent|line.JoinEvent) => {
        console.log(`handle follow ${event.timestamp}`)
    }

    private handleUnfollowEvent = async (event: line.UnfollowEvent|line.LeaveEvent) => {
        console.log(`handle unfollow ${event.timestamp}`)
    }

    private logEvent = (event: line.WebhookEvent) => {
        console.log(`LINE Event: ${event.type}`)
        console.log(`source.type: ${event.source.type}`)
        switch(event.source.type) {
            case 'group':
                console.log(`source.groupId: ${event.source.groupId}`)
                break
            case 'room':
                console.log(`source.roomId: ${event.source.roomId}`)
                break
            case 'user':
                console.log(`source.userId: ${event.source.userId}`)
                break
        }
    }
}