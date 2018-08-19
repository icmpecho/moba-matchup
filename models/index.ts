import {Db} from 'mongodb'
import {PlayerService} from './player'
import {GameService} from './game'
import {LineFollowerService} from './follower'

class Service {

  private playerS: PlayerService
  private gameS: GameService
  private followerS: LineFollowerService

  constructor(db: Db) {
    this.playerS = new PlayerService(db)
    this.gameS = new GameService(db)
    this.followerS = new LineFollowerService(db)
  }

  async createIndexes() {
    await Promise.all([
      this.playerS.createIndexes(),
      this.gameS.createIndexes(),
      this.followerS.createIndexes(),
    ])
  }

  get player(): PlayerService {
    return this.playerS
  }

  get game(): GameService {
    return this.gameS
  }

  get follower(): LineFollowerService {
    return this.followerS
  }
}

export {Service}