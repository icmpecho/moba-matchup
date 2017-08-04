import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {MongoClient} from 'mongodb'

chai.use(chaiAsPromised)
const assert = chai.assert

const mongoConnect = async () => {
  const mongoURL = 'mongodb://localhost:27017/moba-test'
  return MongoClient.connect(mongoURL)
}

export { assert, mongoConnect }
