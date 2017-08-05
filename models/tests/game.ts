import {Db} from 'mongodb'
import {assert, testDB} from './helper'
import {IGame, IEnrichedGame} from '../game'
import {IPlayer} from '../player'
import {Service} from '../index'

describe('GameService', () => {
  let db: Db
  let service: Service
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
      const playerIds = players.map(p => p._id.toHexString())
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
  })

  describe('#submitResult', () => {
    let result: IGame
    let oldGameValue: IEnrichedGame
    beforeEach(() => {
      return async function() {
        oldGameValue = await service.game.enrich(game)
        result = await service.game.submitResult(
          game._id.toHexString(), 0)
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
      return assert.isRejected(service.game.submitResult(
        game._id.toHexString(), 0))
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
  })
})