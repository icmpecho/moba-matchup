import * as _ from 'lodash'
import { Config } from "./config"
import * as line from '@line/bot-sdk'
import { Service as ModelService } from '../models'
import { IEnrichedGame, IEnrichedTeam } from '../models/game'
import { IPlayer } from '../models/player'

export class LineService {
    private config: Config
    private models: ModelService
    private client: line.Client
    
    constructor(config: Config, models: ModelService) {
        this.config = config
        this.models = models
        this.client = new line.Client({channelAccessToken: config.lineAccessToken || 'no-token-provided'})
    }

    get isEnable(): boolean {
        return !(_.isEmpty(this.config.lineSecretKey) || _.isEmpty(this.config.lineAccessToken))
    }

    validateSignature = (signature: string, payload: string): boolean  => {
        return line.validateSignature(payload, this.config.lineSecretKey, signature)
    }

    annouceGame = async (game: IEnrichedGame) => {
        const subscribers = (await this.models.follower.list()).map(x => x.channelId)
        const annoucements = _.map(subscribers, channelId => this.annouceGameToChannel(game, channelId))
        await Promise.all(annoucements)
    }

    buildFlexMessage = (game: IEnrichedGame): line.FlexMessage => {
        return {
            type: 'flex',
            altText: `GAME #${game._id.toHexString()}`,
            contents: this.gameFlexBox(game),
        }
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

    private logEvent = (event: line.WebhookEvent) => {
        console.log(`LINE Event: ${event.type}`)
        console.log(`source.type: ${event.source.type}`)
        const channelId = this.getChannelId(event)
        console.log(`source id: ${channelId}`)
    }

    private annouceGameToChannel = async (game: IEnrichedGame, channelId: string) => {
        const message = this.buildFlexMessage(game)
        await this.client.pushMessage(channelId, message)
        console.log(`Game ${game._id} has been annouced to ${channelId}`)
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

    private playerFlexBox = (player: IPlayer): line.FlexComponent => {
        return {
            type: "box",
            layout: "horizontal",
            contents: [
                {
                    type: "text",
                    text: player.name,
                    size: "sm",
                    color: "#555555",
                    flex: 0
                },
                {
                    type: "text",
                    text: player.rating.toString(),
                    size: "sm",
                    color: "#111111",
                    align: "end"
                },
            ],
        }
    }

    private teamFlexBox = (team: IEnrichedTeam, teamId: string): line.FlexComponent => {
        const teamHeader: line.FlexComponent = {
            type: "text",
            text: `Team ${teamId}`,
            weight: "bold",
            color: "#1DB446",
            size: "lg",
        }
        const playersFlex = _.map(team.players, this.playerFlexBox)
        return {
            type: "box",
            layout: "vertical",
            margin: "xxl",
            spacing: "sm",
            contents: _.concat(teamHeader, playersFlex),
        }
    }

    private gameFlexBox = (game: IEnrichedGame): line.FlexBubble => {
        const title = {
            type: "text",
            text: "GAME",
            weight: "bold",
            color: "#1DB446",
            size: "sm"
        }
        const gameId = {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
                {
                    type: "text",
                    text: "ID",
                    size: "xs",
                    color: "#aaaaaa",
                    flex: 0
                },
                {
                    type: "text",
                    text: game._id.toHexString(),
                    color: "#aaaaaa",
                    size: "xs",
                    align: "end"
                },
            ],
        }
        const separator = {
            type: "separator",
            margin: "xxl",
        }
        const footer = {
            type: "text",
            margin: "xl",
            text: "Manage [Coming Soon]",
            color: "#aaaaaa",
            size: "sm",
            align: "center"
        }
        const team1 = this.teamFlexBox(game.teams[0], '1')
        const team2 = this.teamFlexBox(game.teams[1], '2')
        const contents = _.concat([], title, gameId, separator, team1, separator, team2, separator, footer)
        return {
            type: "bubble",
            styles: {
                footer: {
                  separator: true,
                },
            },
            body: {
                type: "box",
                layout: "vertical",
                contents
            },
        }
    }
}