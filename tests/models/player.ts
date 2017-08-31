import {Db} from 'mongodb'
import * as moment from 'moment'
import { assert, testDB } from '../helper'
import { IPlayer } from '../../models/player'
import { IGame } from '../../models/game'
import { Service } from '../../models'

describe('PlayerService', () => {
  let db: Db
  let service: Service
  beforeEach(() => {
    return async function() {
      db = await testDB()
      service = new Service(db)
      await service.createIndexes()
    }()
  })

  describe('#create', () => {
    let createdPlayer: IPlayer
    beforeEach(() => {
      return async function() {
        createdPlayer = await service.player.create('foo')
      }()
    })

    it('create a new player with the given name', () => {
      assert.equal(createdPlayer.name, 'foo')
    })

    it('has default rating of 0', () => {
      assert.equal(createdPlayer.rating, 0)
    })

    it('actually saved the player', () => {
      return assert.eventually.equal(db.collection('players').count({}), 1)
    })

    it('reject player with the duplicated name', () => {
      return assert.isRejected(service.player.create('foo'))
    })

    it('allow initial rating overide', () => {
      return async function () {
        const p = await service.player.create('bar', 10)
        assert.equal(p.rating, 10)
      }()
    })
  })

  describe('#list', () => {
    let players: IPlayer[]
    beforeEach(() => {
      return async function() {
        let results: Promise<IPlayer>[] = []
        for(let i = 0; i < 60; i++) {
          results.push(service.player.create(`player-${i}`))
        }
        players = await Promise.all(results)
      }()
    })

    it('return list of 50 players by default', () => {
      return async function() {
        const pList = await service.player.list()
        assert.equal(pList.length, 50)
      }()
    })

    it('accept other limit', () => {
      return async function() {
        const pList = await service.player.list({limit: '5'})
        assert.equal(pList.length, 5)
      }()
    })
  })

  describe('#enrich', () => {
    let players: IPlayer[]
    let games: IGame[]
    beforeEach(() => {
      return async function() {
        let results: Promise<IPlayer>[] = []
        for(let i = 0; i < 10; i++) {
          results.push(service.player.create(`player-${i}`, i))
        }
        players = await Promise.all(results)
        games = await Promise.all([
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
            players[7]._id.toHexString(),
            players[9]._id.toHexString(),
          ]),
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
            players[6]._id.toHexString(),
            players[8]._id.toHexString(),
          ]),
        ])
      }()
    })

    it('return total games the player participated in', () => {
      return async function() {
        await service.game.submitResult(games[0]._id.toHexString(), 0)
        await service.game.submitResult(games[1]._id.toHexString(), 1)
        const enrichedPlayers = await Promise.all([
          service.player.enrich(players[0]),
          service.player.enrich(players[6]),
        ])
        assert.equal(enrichedPlayers[0].totalGames, 2)
        assert.equal(enrichedPlayers[1].totalGames, 1)
      }()
    })

    it('return recent games result', () => {
      return async function() {
        await service.game.submitResult(games[0]._id.toHexString(), 0)
        await service.game.submitResult(games[1]._id.toHexString(), 1)
        const enrichedPlayer = await service.player.enrich(players[0])
        assert.deepEqual(enrichedPlayer.recent.gameResults, [true, false])
      }()
    })

    it('returns best with player', () => {
      return async function () {
        await Promise.all([
          service.game.submitResult(games[0]._id.toHexString(), 0),
          service.game.submitResult(games[1]._id.toHexString(), 1),
        ])
        const enrichedPlayer = await service.player.enrich(players[0])
        assert.equal(enrichedPlayer.recent.bestWith.name, players[8].name)
      }()
    })

    it('returns worst with player', () => {
      return async function () {
        await Promise.all([
          service.game.submitResult(games[0]._id.toHexString(), 0),
          service.game.submitResult(games[1]._id.toHexString(), 1),
        ])
        const enrichedPlayer = await service.player.enrich(players[0])
        assert.equal(enrichedPlayer.recent.worstWith.name, players[9].name)
      }()
    })

    it('returns best against player', () => {
      return async function () {
        await Promise.all([
          service.game.submitResult(games[0]._id.toHexString(), 0),
          service.game.submitResult(games[1]._id.toHexString(), 1),
        ])
        const enrichedPlayer = await service.player.enrich(players[0])
        assert.equal(enrichedPlayer.recent.bestAgainst.name, players[6].name)
      }()
    })

    it('returns worst against player', () => {
      return async function () {
        await Promise.all([
          service.game.submitResult(games[0]._id.toHexString(), 0),
          service.game.submitResult(games[1]._id.toHexString(), 1),
        ])
        const enrichedPlayer = await service.player.enrich(players[0])
        assert.equal(enrichedPlayer.recent.worstAgainst.name, players[7].name)
      }()
    })
  })

  describe('#refreshRating', () => {
    let players: IPlayer[]
    let games: IGame[]
    let refreshedPlayer: IPlayer
    beforeEach(() => {
      return async function() {
        let results: Promise<IPlayer>[] = []
        for(let i = 0; i < 2; i++) {
          results.push(service.player.create(`player-${i}`, i))
        }
        players = await Promise.all(results)
        games = await Promise.all([
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
          ]),
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
          ]),
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
          ]),
          service.game.create([
            players[0]._id.toHexString(),
            players[1]._id.toHexString(),
          ]),
        ])
        await Promise.all([
          service.game.submitResult(games[0]._id.toHexString(), 0),
          service.game.submitResult(games[1]._id.toHexString(), 0),
          service.game.submitResult(games[2]._id.toHexString(), 1),
          service.game.submitResult(games[3]._id.toHexString(), 0),
        ])
        const lastMonth = moment().subtract(1, 'months').toDate()
        await db.collection('games').updateOne(
          { _id: games[0]._id },
          { '$set': { ended: lastMonth } },
        )
        await service.player.refreshRating(players[0]._id)
        refreshedPlayer = await service.player.get(
          players[0]._id.toHexString())
      }()
    })

    it('refresh player rating based on games in last two weeks', () => {
      assert.equal(refreshedPlayer.rating, 1)
    })

    describe('#refreshAllRatings', () => {
      it('refresh ratings of every players', () => {
        return async function() {
          await service.player.refreshAllRatings()
          const refreshedPlayers = await Promise.all([
            service.player.get(players[0]._id.toHexString()),
            service.player.get(players[1]._id.toHexString()),
          ])
          assert.equal(refreshedPlayers[0].rating, 1)
          assert.equal(refreshedPlayers[1].rating, -1)
        }()
      })
    })
  })
})