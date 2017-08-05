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

    it('has default rating of 0', () => {
      assert.equal(createdPlayer.rating, 0)
    })

    it('actually saved the player', () => {
      return assert.eventually.equal(db.collection('players').count({}), 1)
    })

    it('reject player with the duplicated name', () => {
      return assert.isRejected(service.create('foo'))
    })

    it('allow initial rating overide', () => {
      return async function () {
        const p = await service.create('bar', 10)
        assert.equal(p.rating, 10)
      }()
    })
  })

  describe('#list', () => {
    let players: IPlayer[]
    beforeEach(() => {
      return async function() {
        let results: Promise<IPlayer>[] = []
        for(let i = 0; i < 20; i++) {
          results.push(service.create(`player-${i}`))
        }
        players = await Promise.all(results)
      }()
    })

    it('return list of 10 players by default', () => {
      return async function() {
        const pList = await service.list()
        assert.equal(pList.length, 10)
      }()
    })

    it('accept other limit', () => {
      return async function() {
        const pList = await service.list(5)
        assert.equal(pList.length, 5)
      }()
    })
  })
})