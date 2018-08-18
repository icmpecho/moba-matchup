export class Config {
    mongoUri: string
    port: number
    lineSecretKey: string
    lineAccessToken: string

    constructor(
        mongoUri: string,
        port: number,
        lineSecretKey: string,
        lineAccessToken: string,
    ) {
        this.mongoUri = mongoUri
        this.port = port
        this.lineSecretKey = lineSecretKey
        this.lineAccessToken = lineAccessToken
    }

    static buildFromEnv(): Config {
        const mongoUri = 
            process.env.MONGO_URI ||
            process.env.MONGODB_URI ||
            'mongodb://localhost:27017/moba'
        const port = parseInt(process.env.PORT) || 3000
        const lineSecretKey = process.env.LINE_SECRET_KEY
        const lineAccessToken = process.env.LINE_ACCESS_TOKEN
        return new Config(mongoUri, port, lineSecretKey, lineAccessToken)
    }
}