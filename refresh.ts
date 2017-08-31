import {Service as ModelService} from './models'
import {MongoClient} from 'mongodb'


const main = async () => {
  const mongoUri = 
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/moba'
  console.log(`Connecting to the database [ ${mongoUri} ]`)
  const db = await MongoClient.connect(mongoUri)
  const services = new ModelService(db)
  console.log('Refreshing ratings...')
  await services.player.refreshAllRatings()
  console.log('Done.')
  process.exit(0)
}

main()
