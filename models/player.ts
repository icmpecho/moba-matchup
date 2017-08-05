import {Db, ObjectID, Collection} from 'mongodb'

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
    return this.collection.find({}).sort('name', 1).limit(limit).toArray()
  }
}

export {IPlayer, PlayerService}
