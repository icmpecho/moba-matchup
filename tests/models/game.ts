import {Db} from 'mongodb'
import {assert, testDB} from '../helper'
import {IGame, IEnrichedGame} from '../../models/game'
import {IPlayer} from '../../models/player'
import {Service} from '../../models'

describe('GameService', () => {
  let db: Db
  let service: Service
  let playerIds: string[]
  let players: IPlayer[]
  let game: IGame
  beforeEach(() => {
    return async function() {
      db = await testDB()
      service = new Service(db)
      await service.createIndexes()
      players = []
      for(let i = 0; i < 10; i++) {
        const p = await service.player.create(`player-${i}`, i)
        players.push(p)
      }
      playerIds = players.map(p => p._id.toHexString())
      game = await service.game.create(playerIds)
    }()
  })

  describe('#create', () => {
    it('split team into 5v5', () => {
      const teams = game.teams
      assert.equal(teams[0].playerIds.length, 5)
      assert.equal(teams[1].playerIds.length, 5)
      assert.equal(teams.length, 2)
    })

    it('balance team rating', () => {
      const teams = game.teams
      const diff = Math.abs(teams[0].rating - teams[1].rating)
      assert.isAtMost(diff, 1)
    })
  })

  describe('#cancel', () => {
    it('mark game as canceled', () => {
      return async function() {
        const result = await service.game.cancel(game._id.toHexString())
        assert.isTrue(result.canceled)
      }()
    })

    it('reject if game does not exists', () => {
      return assert.isRejected(
        service.game.cancel('AAAAAAAAAAAAAAAAAAAAAAAA'))
    })

    it('reject if game is ended', () => {
      return async function() {
        await service.game.submitResult(game._id.toHexString(), 0)
        return assert.isRejected(service.game.cancel(game._id.toHexString()))
      }()
    })

    it('reject if game is canceled', () => {
      return async function() {
        await service.game.cancel(game._id.toHexString())
        return assert.isRejected(service.game.cancel(game._id.toHexString()))
      }()
    })
  })

  describe('#submitResult', () => {
    let result: IGame
    let oldGameValue: IEnrichedGame
    beforeEach(() => {
      return async function() {
        oldGameValue = await service.game.enrich(game)
        result = await service.game.submitResult(
          game._id.toHexString(), 0, [players[5]._id, players[3]._id])
      }()  
    })
  
    it('mark winner', () => {
      assert.equal(result.winner, 0)
    })

    it('reject if game is ended', () => {
      return assert.isRejected(service.game.submitResult(
        game._id.toHexString(), 0))
    })

    it('reject if game is canceled', () => {
      return async function() {
        const canceledGame = await service.game.create(playerIds)
        await service.game.cancel(canceledGame._id.toHexString())
        return assert.isRejected(service.game.submitResult(
          canceledGame._id.toHexString(), 0))
      }()
    })

    it('increment winner rating', () => {
      return async function() {
        const newGameValue = await service.game.enrich(result)
        for(let i = 0; i < 5; i++) {
          const oldRating = oldGameValue.teams[0].players[i].rating
          const newRating = newGameValue.teams[0].players[i].rating
          assert.isAbove(newRating, oldRating)
        }
      }()
    })

    it('decrement loser rating', () => {
      return async function() {
        const newGameValue = await service.game.enrich(result)
        for(let i = 0; i < 5; i++) {
          const oldRating = oldGameValue.teams[1].players[i].rating
          const newRating = newGameValue.teams[1].players[i].rating
          assert.isBelow(newRating, oldRating)
        }
      }()
    })

    it('assign mvp to correct team', () => {
      assert.equal(
        result.teams[0].mvp.toHexString(), players[3]._id.toHexString())
      assert.equal(
        result.teams[1].mvp.toHexString(), players[5]._id.toHexString())
    })
  })

  describe('#enrich', () => {
    let enrichedGame: IEnrichedGame
    beforeEach(() => {
      return async function () {
        enrichedGame = await service.game.enrich(game)
      }()
    })

    it('set active flag', () => {
      assert.isTrue(enrichedGame.active)
    })

    it('change playerIds into players', () => {
      assert.equal(enrichedGame.teams[0].players[0].name, players[0].name)
    })
  })
})