import {Db, ObjectID, Collection} from 'mongodb'
import * as _ from 'lodash'
import {IPlayer} from './player'
import {ModelNotFoundError} from './error'

interface ITeam {
  playerIds: ObjectID[],
  mvp?: ObjectID,
  rating: number,
}

interface IGame {
  _id: ObjectID
  created: Date
  ended?: Date
  winner?: number
  teams: ITeam[]
  canceled: boolean
}

interface IEnrichedTeam {
  players: IPlayer[],
  mvp?: ObjectID,
  rating: number,
}

interface IEnrichedGame {
  _id: ObjectID
  created: Date
  ended?: Date
  winner?: number
  teams: IEnrichedTeam[]
  canceled: boolean
  active: boolean
}

const activeQuery = {
  '$or': [
    { winner: { '$exists': false } },
    { winner: null },
  ],
  canceled: false,
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

  async list(query:any={}): Promise<IEnrichedGame[]> {
    let filter: any = {}
    if(!(query.showCanceled in ['true', 'True', 't', 'T', '1'])){
      filter.canceled = false
    }
    const games = await this.collection
      .find(filter).sort('created', -1).limit(10).toArray()
    return Promise.all(_.map(games, x => this.enrich(x)))
  }

  async get(gameId: string): Promise<IGame> {
    const id = new ObjectID(gameId)
    const game = await this.collection.findOne({_id: id})
    if(_.isNil(game)) {
      throw new ModelNotFoundError('Game not found')
    }
    return game
  }

  async cancel(gameId: string): Promise<IGame> {
    const id = new ObjectID(gameId)
    const result = await this.collection.findOneAndUpdate(
      _.assign({_id: id}, activeQuery),
      {'$set': {canceled: true}}, {returnOriginal: false})
    const game = result.value
    if (_.isNil(game)) {
      throw new ModelNotFoundError('Active game not found')
    }
    return game
  }

  async submitResult(
    gameId: string, winnerTeam: number, mvps: string[] = []): Promise<IGame> {
    const id = new ObjectID(gameId)
    let game: IGame = await this.collection.findOne({_id: id})
    if (_.isNil(game)) {
      throw new ModelNotFoundError('Game not found')
    }
    mvps.forEach(pid => {
      game.teams.forEach(team => {
        const playerIds = _.map(team.playerIds, x => x.toHexString())
        if(_.includes(playerIds, pid)) {
          team.mvp = new ObjectID(pid)
        }
      })
    })
    game.winner = winnerTeam
    game.ended = new Date(Date.now())
    const result = await this.collection.findOneAndUpdate(
      _.assign({_id: id}, activeQuery),
      game,
      {returnOriginal: false})
    game = result.value
    if (_.isNil(game)) {
      throw new ModelNotFoundError('Active game not found')
    }
    await this.updateRating(game)
    return game
  }

  async create(playerIds: string[]): Promise<IGame> {
    playerIds = _.uniq(playerIds)
    const pCollection = this.db.collection('players')
    const players = await pCollection
      .find({_id: {'$in': _.map(playerIds, x => new ObjectID(x))}})
      .toArray()
    const teams = this.assignTeams(players)
    return this._create(teams[0], teams[1])
  }

  async enrich(game: IGame): Promise<IEnrichedGame> {
    const pCollection = this.db.collection('players')
    const [t1Players, t2Players] = await Promise.all([
      pCollection.find({_id: {'$in': game.teams[0].playerIds}}).toArray(),
      pCollection.find({_id: {'$in': game.teams[1].playerIds}}).toArray(),
    ])
    let result: any = _.cloneDeep(game)
    delete result.teams[0].playerIds
    result.teams[0].players = t1Players
    delete result.teams[1].playerIds
    result.teams[1].players = t2Players
    result.active = this.isActive(game)
    return result
  }

  private assignTeams(players: IPlayer[]): ITeam[] {
    const sortedPlayers = _.orderBy(players, 'rating', 'desc')
    const weakestPlayer = sortedPlayers[sortedPlayers.length - 1]
    const lowestRating = weakestPlayer.rating
    const adjustment = lowestRating < 0 ? Math.abs(lowestRating) : 0
    const adjustedPlayers = _.map(sortedPlayers, p => {
      p.rating += adjustment
      return p
    })
    let teams: IPlayer[][] = [[], []]
    adjustedPlayers.forEach(p => {
      teams = _.sortBy(teams, this.teamRating)
      if(teams[0].length < adjustedPlayers.length/2) {
        teams[0].push(p)
      } else {
        teams[1].push(p)
      }
    })
    return [
      {playerIds: _.map(teams[0], '_id'), rating: this.teamRating(teams[0])},
      {playerIds: _.map(teams[1], '_id'), rating: this.teamRating(teams[1])},
    ]
  }

  private teamRating(team: IPlayer[]): number {
    return _.sumBy(team, 'rating')
  }

  private async _create(team1: ITeam, team2: ITeam): Promise<IGame> {
    const game = {
      created: new Date(Date.now()),
      teams: [team1, team2],
      canceled: false,
    }
    const inserted = await this.collection.insertOne(game)
    return this.collection.findOne({_id: inserted.insertedId})
  }

  private isActive(game: IGame): boolean {
    return _.isNil(game.winner) && !game.canceled
  }

  private async updateRating(game: IGame) {
    const pCollection = this.db.collection('players')
    const winner = game.winner
    const winnerIds = game.teams[winner].playerIds
    const loserIds = game.teams[1-winner].playerIds
    await Promise.all([
      pCollection.updateMany(
        {_id: {'$in': winnerIds}},
        {'$inc': {rating: 1}},
      ),
      pCollection.updateMany(
        {_id: {'$in': loserIds}},
        {'$inc': {rating: -1}},
      ),
    ])
    const mvps = _.filter(
      [game.teams[0].mvp, game.teams[1].mvp], x => !_.isNil(x))
    if (mvps.length > 0) {
      await pCollection.updateMany(
        {_id: {'$in': mvps}},
        {'$inc': {rating: 1}},
      )
    }
  }
}

export {IGame, IEnrichedGame, ITeam, GameService}
