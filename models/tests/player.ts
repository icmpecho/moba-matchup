import {Db} from 'mongodb'
import { assert, testDB } from './helper'
import { PlayerService, IPlayer } from '../player'

describe('PlayerService', () => {
  let db: Db
  let service: PlayerService
  beforeEach(() => {
    return async function() {
      db = await testDB()
      service = new PlayerService(db)
      await service.createIndexes()
    }()
  })

  describe('#create', () => {
    let createdPlayer: IPlayer
    beforeEach(() => {
      return async function() {
        createdPlayer = await service.create('foo')
      }()
    })

    it('create a new player with the given name', () => {
      assert.equal(createdPlayer.name, 'foo')
    })

    it('actually saved the player', () => {
      return assert.eventually.equal(db.collection('players').count({}), 1)
    })

    it('reject player with the duplicated name', () => {
      return assert.isRejected(service.create('foo'))
    })
  })
})