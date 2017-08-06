import {Db, ObjectID, Collection} from 'mongodb'
import * as _ from 'lodash'
import {IPlayer} from './player'
import {ModelNotFoundError} from './error'

interface ITeam {
  playerIds: ObjectID[],
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
  rating: number,
}

interface IEnrichedGame {
  _id: ObjectID
  created: Date
  ended?: Date
  winner?: number
  teams: IEnrichedTeam[]
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

  async list(query: {limit?: string}={}): Promise<IEnrichedGame[]> {
    const limit = parseInt(query.limit) || 10
    const games = await this.collection
      .find({}).sort('created', -1).limit(limit).toArray()
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
      {
        _id: id, '$or': [{winner: {'$exists': false}}, {winner: null}],
        canceled: false
      },
      {'$set': {canceled: true}}, {returnOriginal: false})
    const game = result.value
    if (_.isNil(game)) {
      throw new ModelNotFoundError('Active game not found')
    }
    return game
  }

  async submitResult(
    gameId: string, winnerTeam: number): Promise<IGame> {
    const id = new ObjectID(gameId)
    const result = await this.collection.findOneAndUpdate(
      {
        _id: id, '$or': [{winner: {'$exists': false}}, {winner: null}],
        canceled: false
      },
      {'$set': {winner: winnerTeam, ended: new Date(Date.now())}},
      {returnOriginal: false})
    const game = result.value
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
    return {
      _id: game._id,
      created: game.created,
      ended: game.ended,
      canceled: game.canceled,
      winner: game.winner,
      teams: [
        {
          players: t1Players,
          rating: game.teams[0].rating,
        },
        {
          players: t2Players,
          rating: game.teams[1].rating,
        },
      ]
    }
  }

  private assignTeams(players: IPlayer[]): ITeam[] {
    const sortedPlayers = _.orderBy(players, 'rating', 'desc')
    let teams: IPlayer[][] = [[], []]
    sortedPlayers.forEach(p => {
      teams = _.sortBy(teams, this.teamRating)
      if(teams[0].length < 5) {
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
  }
}

export {IGame, IEnrichedGame, ITeam, GameService}
