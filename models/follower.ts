import {Db, ObjectID, Collection} from 'mongodb'

interface IFollower {
    _id: ObjectID
    created: Date
    type: string
    channelId: string
}

class LineFollowerService {
    private db: Db
    private collection: Collection

    constructor(db: Db) {
        this.db = db
        this.collection = this.db.collection('lineFollowers')
    }

    async createIndexes() {
        await Promise.all([
            this.collection.createIndex({created: -1}),
            this.collection.createIndex({type: 1}),
            this.collection.createIndex({channelId: 1}),
        ])
    }

    async follow(type: string, channelId: string): Promise<IFollower> {
        const follower = {
            created: new Date(Date.now()),
            type,
            channelId,
        }
        const inserted = await this.collection.insertOne(follower)
        return await this.collection.findOne({_id: inserted.insertedId})
    }

    async unfollow(type: string, channelId: string) {
        await this.collection.deleteOne({type, channelId})
    }

    async list(): Promise<IFollower[]> {
        // TODO: Change to stream interface if there's a lot of followers
        return await this.collection.find().toArray()
    }
}

export {IFollower, LineFollowerService}