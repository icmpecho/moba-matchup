export class Config {
    mongoUri: string
    port: number

    constructor(mongoUri: string, port: number) {
        this.mongoUri = mongoUri
        this.port = port
    }

    static buildFromEnv(): Config {
        const mongoUri = 
            process.env.MONGO_URI ||
            process.env.MONGODB_URI ||
            'mongodb://localhost:27017/moba'
        const port = parseInt(process.env.PORT) || 3000
        return new Config(mongoUri, port)
    }
}