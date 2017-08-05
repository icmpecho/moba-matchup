import {Db, ObjectID, Collection} from 'mongodb'

interface IPlayer {
  _id: ObjectID
  name: string
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

  async create(name: string): Promise<IPlayer> {
    const inserted = await this.collection.insertOne({name: name})
    return this.collection.findOne({_id: inserted.insertedId})
  }

  async list(limit=10): Promise<IPlayer[]> {
    return this.collection.find({}).sort('name', 1).limit(limit).toArray()
  }
}

export {IPlayer, PlayerService}
