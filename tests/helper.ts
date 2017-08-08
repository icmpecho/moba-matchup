import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {MongoClient} from 'mongodb'

chai.use(chaiAsPromised)
const assert = chai.assert

const testDB = async () => {
  const mongoURL = 'mongodb://localhost:27017/moba-test'
  const db = await MongoClient.connect(mongoURL)
  await db.dropDatabase()
  return db
}

export { assert, testDB }
