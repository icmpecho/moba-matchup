import {Db, ObjectID} from 'mongodb'
import { assert, testDB } from './helper'
import { GameService, IGame } from '../game'

describe('GameService', () => {
  let db: Db
  let service: GameService
  beforeEach(() => {
    return async function() {
      db = await testDB()
      service = new GameService(db)
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
        createdGame = await service.create(
          {players: pids.slice(0, 5)},
          {players: pids.slice(5, 10)},
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
          const result = await service.cancel(createdGame._id.toHexString())
          assert.isTrue(result.canceled)
        }()
      })

      it('reject if game does not exists', () => {
        return assert.isRejected(service.cancel('AAAAAAAAAAAAAAAAAAAAAAAA'))
      })
    })
    
  })
})