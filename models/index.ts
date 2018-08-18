import {Db} from 'mongodb'
import {PlayerService} from './player'
import {GameService} from './game'

class Service {

  private playerS: PlayerService
  private gameS: GameService

  constructor(db: Db) {
    this.playerS = new PlayerService(db)
    this.gameS = new GameService(db)
  }

  async createIndexes() {
    await Promise.all([
      this.playerS.createIndexes(),
      this.gameS.createIndexes(),
    ])
  }

  get player(): PlayerService {
    return this.playerS
  }

  get game(): GameService {
    return this.gameS
  }
}

export {Service}