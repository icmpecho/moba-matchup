import * as _ from 'lodash'
import { Config } from "./config";

export class LineService {
    config: Config
    
    constructor(config: Config) {
        this.config = config
    }

    public get isEnable(): boolean {
        return !(_.isEmpty(this.config.lineSecretKey) || _.isEmpty(this.config.lineAccessToken))
    }
}