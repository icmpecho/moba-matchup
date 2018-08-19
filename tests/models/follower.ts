import {Db} from 'mongodb'
import {assert, testDB} from '../helper'
import {Service} from '../../models'
import { IFollower } from '../../models/follower'

describe('LineFollowerService', () => {
    let db: Db
    let service: Service

    beforeEach(async () => {
        db = await testDB()
        service = new Service(db)
        await service.createIndexes()
    })

    describe('#follow', () => {
        it('add new follower', async () => {
            await service.follower.follow('user', 'some-user-id')
            const count = await db.collection('lineFollowers').count({})
            assert.equal(1, count)
        })
    })

    describe('#unfollow', () => {
        beforeEach(async () => {
            await Promise.all([
                service.follower.follow('user', 'some-user-id'),
                service.follower.follow('group', 'some-group-id'),
                service.follower.follow('room', 'some-room-id'),
            ])
        })
        it('remove follower', async () => {
            await service.follower.unfollow('user', 'some-user-id')
            const count = await db.collection('lineFollowers').count({})
            assert.equal(2, count)
        })
        it('does nothing if follower not found', async () => {
            await service.follower.unfollow('user', 'random-user-id')
            const count = await db.collection('lineFollowers').count({})
            assert.equal(3, count)
        })
    })

    describe('#list', () => {
        let result: IFollower[]
        beforeEach(async () => {
            await Promise.all([
                service.follower.follow('user', 'some-user-id'),
                service.follower.follow('group', 'some-group-id'),
                service.follower.follow('room', 'some-room-id'),
            ])
            result = await service.follower.list()
        })
        it('return list of followers', () => {
            assert.equal(3, result.length)
        })
        it('return correct channelId', () => {
            const channelIds = result.map(x => x.channelId)
            assert.include(channelIds, 'some-user-id')
            assert.include(channelIds, 'some-group-id')
            assert.include(channelIds, 'some-room-id')
        })
    })
})