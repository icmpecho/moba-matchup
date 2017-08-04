import {Db, ObjectID} from "mongodb"

interface IPlayer {
  _id: ObjectID
  name: string
}

class PlayerService {

  private db: Db

  constructor(db: Db) {
    this.db = db
  }

  async create(name: string): Promise<IPlayer> {
    const players = this.db.collection('players')
    const inserted = await players.insertOne({name: name})
    return players.findOne({_id: inserted.insertedId})
  }
}

export {IPlayer, PlayerService}
