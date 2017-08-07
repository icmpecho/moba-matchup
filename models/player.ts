import * as _ from 'lodash'
import {Db, ObjectID, Collection} from 'mongodb'
import {ModelNotFoundError} from './error'

interface IPlayer {
  _id: ObjectID
  name: string
  rating: number
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
}

export {IPlayer, PlayerService}
