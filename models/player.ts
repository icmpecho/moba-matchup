import * as _ from 'lodash'
import {Db, ObjectID, Collection} from 'mongodb'
import {IGame} from './game'
import {ModelNotFoundError} from './error'
import * as moment from 'moment'

interface IPlayer {
  _id: ObjectID
  name: string
  rating: number
}

interface IEnrichedPlayer extends IPlayer{
  totalGames: number
  recent: {
    gameResults: boolean[]
    bestWith?: IPlayer,
    worstWith: IPlayer,
    bestAgainst: IPlayer,
    worstAgainst: IPlayer,
  }
}

class PlayerService {

  private db: Db
  private collection: Collection

  constructor(db: Db) {
    this.db = db
    this.collection = this.db.collection('players')
  }

  async createIndexes() {
    await this.collection.createIndex({name: 1}, {unique: true})
  }

  async create(name: string, rating=0): Promise<IPlayer> {
    const inserted = await this.collection.insertOne({
      name: name, rating: rating})
    return this.collection.findOne({_id: inserted.insertedId})
  }

  async list(query: {limit?: string} = {}): Promise<IPlayer[]> {
    const limit = parseInt(query.limit) || 50
    return this.collection.find({}).sort('rating', -1).limit(limit).toArray()
  }

  async get(playerId: string): Promise<IPlayer> {
    const id = new ObjectID(playerId)
    const player = await this.collection.findOne({_id: id})
    if(_.isNil(player)) {
      throw new ModelNotFoundError('Player not found')
    }
    return player
  }

  async enrich(player: IPlayer): Promise<IEnrichedPlayer> {
    const [totalGames, recentGames] = await Promise.all([
      this.totalGames(player),
      this.recentGames(player),
    ])
    const bestWithList = this.bestWithList(player, recentGames)
    const bestAgainstList = this.bestAgainstList(player, recentGames)
    const [ bw, ww, ba, wa ] = await Promise.all([
      this.collection.findOne({_id: new ObjectID(_.first(bestWithList))}),
      this.collection.findOne({_id: new ObjectID(_.last(bestWithList))}),
      this.collection.findOne({_id: new ObjectID(_.first(bestAgainstList))}),
      this.collection.findOne({_id: new ObjectID(_.last(bestAgainstList))}),
    ])
    let enrichedPlayer: any = _.cloneDeep(player)
    enrichedPlayer.totalGames = totalGames
    enrichedPlayer.recent = {
      gameResults: this.recentResults(player._id, recentGames),
      bestWith: bw,
      worstWith: ww,
      bestAgainst: ba,
      worstAgainst: wa,
    }
    return enrichedPlayer
  }

  async refreshRating(playerId: ObjectID) {
    const lastTwoWeeks = moment().subtract(2, 'weeks').toDate()
    const recentGames: IGame[] = await this.db.collection('games').find({
      teams: { '$elemMatch': { playerIds: playerId } },
      winner: { '$exists': true, '$ne': null },
      ended: { '$gte': lastTwoWeeks },
    }).toArray()
    const mvpCount = this.mvpCount(playerId, recentGames)
    const recentResults = this.recentResults(playerId, recentGames)
    const wonCount = _.filter(recentResults).length
    const loseCount = recentGames.length - wonCount
    const rating = mvpCount + wonCount - loseCount
    await this.collection.updateOne(
      { _id: playerId },
      { '$set': { rating: rating } }
    )
  }

  async refreshAllRatings() {
    const players = await this.collection.find({}).toArray()
    const promises: Promise<void>[] = []
    players.forEach((player: IPlayer) => {
      promises.push(this.refreshRating(player._id))
    })
    await Promise.all(promises)
  }

  private async totalGames(player: IPlayer): Promise<number> {
    const collection = this.db.collection('games')
    return collection.count({
      teams: { '$elemMatch': { playerIds: player._id }},
      winner: { '$exists': true, '$ne': null },
    })
  }

  private async recentGames(player: IPlayer): Promise<IGame[]> {
    const collection = this.db.collection('games')
    return collection.find({
      teams: { '$elemMatch': { playerIds: player._id }},
      winner: { '$exists': true, '$ne': null },
    }).sort('ended', -1).limit(10).toArray()
  }

  private mvpCount(playerId: ObjectID, games: IGame[]): number {
    let count = 0
    games.forEach(game => {
      game.teams.forEach(team => {
        if(playerId.equals(team.mvp)) {
          count += 1
        }
      })
    })
    return count
  }

  private recentResults(
      playerId: ObjectID, recentGames: IGame[]): boolean[] {

    return recentGames.map(game => {
      const playerIds = game.teams[game.winner].playerIds
      for(let i = 0; i < playerIds.length; i++) {
        if (playerIds[i].equals(playerId)) {
          return true
        }
      }
      return false
    })
  }

  private playerTeamId(player: IPlayer, game: IGame): number {
    let result: number = 1
    game.teams[0].playerIds.forEach(pid => {
      if (player._id.equals(pid)) {
        result = 0
        return
      }
    })
    return result
  }

  private wonWith(player: IPlayer, games: IGame[]): string[] {
    let result: string[] = []
    games.forEach(game => {
      const playerTeamId = this.playerTeamId(player, game)
      if(playerTeamId != game.winner) {
        return
      }
      game.teams[playerTeamId].playerIds
        .map(x => x.toHexString())
        .forEach(pid => {
          if (pid != player._id.toHexString()) {
            result.push(pid)
          }
        })
    })
    return result
  }

  private loseWith(player: IPlayer, games: IGame[]): string[] {
    let result: string[] = []
    games.forEach(game => {
      const playerTeamId = this.playerTeamId(player, game)
      if(playerTeamId == game.winner) {
        return
      }
      game.teams[playerTeamId].playerIds
        .map(x => x.toHexString())
        .forEach(pid => {
          if (pid != player._id.toHexString()) {
            result.push(pid)
          }
        })
    })
    return result
  }

  private ratingWith(player: IPlayer, games: IGame[]): [string, number][] {
    const wonWith = _.countBy(this.wonWith(player, games))
    const loseWith = _.countBy(this.loseWith(player, games))
    
    return _.toPairs(_.mergeWith(wonWith, loseWith, (w=0, l=0) => w - l))
  }

  private bestWithList(player: IPlayer, games: IGame[]): string[] {
    const result: any = _.chain(this.ratingWith(player, games))
      .orderBy(1, 'desc').map(0).value()
    return result
  }

  private wonAgainst(player: IPlayer, games: IGame[]): string[] {
    let result: string[] = []
    games.forEach(game => {
      const playerTeamId = this.playerTeamId(player, game)
      if(playerTeamId != game.winner) {
        return
      }
      game.teams[1-playerTeamId].playerIds
        .map(x => x.toHexString())
        .forEach(pid => {
          if (pid != player._id.toHexString()) {
            result.push(pid)
          }
        })
    })
    return result
  }

  private loseAgainst(player: IPlayer, games: IGame[]): string[] {
    let result: string[] = []
    games.forEach(game => {
      const playerTeamId = this.playerTeamId(player, game)
      if(playerTeamId == game.winner) {
        return
      }
      game.teams[1-playerTeamId].playerIds
        .map(x => x.toHexString())
        .forEach(pid => {
          if (pid != player._id.toHexString()) {
            result.push(pid)
          }
        })
    })
    return result
  }

  private ratingAgainst(player: IPlayer, games: IGame[]): [string, number][] {
    const wonAgainst = _.countBy(this.wonAgainst(player, games))
    const loseAgainst = _.countBy(this.loseAgainst(player, games))
    return _.toPairs(_.mergeWith(wonAgainst, loseAgainst, (w=0, l=0) => w - l))
  }

  private bestAgainstList(player: IPlayer, games: IGame[]): string[] {
    const result: any = _.chain(this.ratingAgainst(player, games))
      .orderBy(1, 'desc').map(0).value()
    return result
  }
}

export {IPlayer, PlayerService}
