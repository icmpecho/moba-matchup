import {Db, ObjectID} from 'mongodb'
import {assert, testDB} from './helper'
import {IGame} from '../game'
import {IPlayer} from '../player'
import {Service} from '../index'

describe('GameService', () => {
  let db: Db
  let service: Service
  beforeEach(() => {
    return async function() {
      db = await testDB()
      service = new Service(db)
      await service.createIndexes()
    }()
  })

  describe('#create, #cancel', () => {
    let createdGame: IGame
    beforeEach(() => {
      return async function() {
        const pids: ObjectID[] = []
        for(let i = 0; i < 10; i++) {
          pids.push(new ObjectID())
        }
        createdGame = await service.game.create(
          {playerIds: pids.slice(0, 5), rating: 0},
          {playerIds: pids.slice(5, 10), rating: 0},
        )
      }()
    })
    
    describe('#create', () => {
      it('create a new game in db', () => {
        return assert.eventually.equal(db.collection('games').count({}), 1)
      })

      it('set initial cancel flag to false', () => {
        assert.equal(createdGame.canceled, false)
      })
    })

    describe('#cancel', () => {
      it('mark game as canceled', () => {
        return async function() {
          const result = await service.game.cancel(
            createdGame._id.toHexString())
          assert.isTrue(result.canceled)
        }()
      })

      it('reject if game does not exists', () => {
        return assert.isRejected(
          service.game.cancel('AAAAAAAAAAAAAAAAAAAAAAAA'))
      })
    })
    
    describe('#autoCreate', () => {
      let players: IPlayer[]
      let game: IGame
      beforeEach(() => {
        return async function() {
          players = []
          for(let i = 0; i < 10; i++) {
            const p = await service.player.create(`player-${i}`, i)
            players.push(p)
          }
          const playerIds = players.map(p => p._id.toHexString())
          game = await service.game.autoCreate(playerIds)
        }()
      })

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
  })
})