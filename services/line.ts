import * as _ from 'lodash'
import { Config } from "./config"
import * as line from '@line/bot-sdk'
import { Service as ModelService } from '../models';

export class LineService {
    private config: Config
    private models: ModelService
    
    constructor(config: Config, models: ModelService) {
        this.config = config
        this.models = models
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
        const channelId = this.getChannelId(event)
        const result = await this.models.follower.follow(event.source.type, channelId)
        console.log(`${result.channelId} is subscribed`)
    }

    private handleUnfollowEvent = async (event: line.UnfollowEvent|line.LeaveEvent) => {
        const channelId = this.getChannelId(event)
        await this.models.follower.unfollow(event.source.type, channelId)
        console.log(`${channelId} is unsubscribed`)
    }

    private getChannelId = (event: line.WebhookEvent): string => {
        switch(event.source.type) {
            case 'group':
                return event.source.groupId
            case 'room':
                return event.source.roomId
            case 'user':
                return event.source.userId
        }
    }

    private logEvent = (event: line.WebhookEvent) => {
        console.log(`LINE Event: ${event.type}`)
        console.log(`source.type: ${event.source.type}`)
        const channelId = this.getChannelId(event)
        console.log(`source id: ${channelId}`)
    }
}