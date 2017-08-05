import {Db} from 'mongodb'
import {PlayerService} from './player'
import {GameService} from './game'

class Service {

  private db: Db
  private playerS: PlayerService
  private gameS: GameService

  constructor(db: Db) {
    this.db = db
    this.playerS = new PlayerService(db)
    this.gameS = new GameService(db)
  }

  get player(): PlayerService {
    return this.playerS
  }

  get game(): GameService {
    return this.gameS
  }
}

export {Service}