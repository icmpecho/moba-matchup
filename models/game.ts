import {Db, ObjectID, Collection} from 'mongodb'

interface ITeam {
  players: ObjectID[]
}

interface IGame {
  _id: ObjectID
  created: Date
  ended?: Date
  teams: ITeam[]
  canceled: boolean
}

class GameService {

  private db: Db
  private collection: Collection

  constructor(db: Db) {
    this.db = db
    this.collection = this.db.collection('games')
  }

  async createIndexes() {
    await Promise.all([
      this.collection.createIndex({created: -1}),
      this.collection.createIndex({ended: -1}),
      this.collection.createIndex({'teams.players': 1}),
      this.collection.createIndex({canceled: 1}),
    ])
  }

  async create(team1: ITeam, team2: ITeam): Promise<IGame> {
    const game = {
      created: new Date(Date.now()),
      teams: [team1, team2],
      canceled: false,
    }
    const inserted = await this.collection.insertOne(game)
    return this.collection.findOne({_id: inserted.insertedId})
  }

  async cancel(gameId: string): Promise<IGame> {
    const id = new ObjectID(gameId)
    const result = await this.collection.findOneAndUpdate(
      {_id: id}, {'$set': {canceled: true}}, {returnOriginal: false})
    if (!result.value) {
      throw new Error('Game not found')
    }
    return result.value
  }
}

export {IGame, ITeam, GameService}
