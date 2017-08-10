import * as _ from 'lodash'
import {Db, ObjectID, Collection} from 'mongodb'
import {IGame} from './game'
import {ModelNotFoundError} from './error'

interface IPlayer {
  _id: ObjectID
  name: string
  rating: number
}

interface IEnrichedPlayer extends IPlayer{
  totalGames: number
  recentResults: boolean[]
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
    const [totalGames, recentResults] = await Promise.all([
      this.totalGames(player),
      this.recentResults(player),
    ])
    let enrichedPlayer: any = _.cloneDeep(player)
    enrichedPlayer.totalGames = totalGames
    enrichedPlayer.recentResults = recentResults
    return enrichedPlayer
  }

  private async totalGames(player: IPlayer): Promise<number> {
    const collection = this.db.collection('games')
    return collection.count({
      teams: { '$elemMatch': { playerIds: player._id }}
    })
  }

  private async recentResults(player: IPlayer): Promise<boolean[]> {
    const collection = this.db.collection('games')

    const recentGames: IGame[] = await collection.find({
      teams: { '$elemMatch': { playerIds: player._id }},
      winner: { '$exists': true, '$ne': null },
    }).sort('ended', -1).limit(5).toArray()

    return recentGames.map(game => {
      const playerIds = game.teams[game.winner].playerIds
      for(let i = 0; i < playerIds.length; i++) {
        if (playerIds[i].equals(player._id)) {
          return true
        }
      }
      return false
    })
  }
}

export {IPlayer, PlayerService}
