import * as _ from 'lodash'
import { Config } from "./config";
import * as line from '@line/bot-sdk';

export class LineService {
    config: Config
    
    constructor(config: Config) {
        this.config = config
    }

    get isEnable(): boolean {
        return !(_.isEmpty(this.config.lineSecretKey) || _.isEmpty(this.config.lineAccessToken))
    }

    validateSignature(signature: string, payload: string): boolean {
        return line.validateSignature(payload, this.config.lineSecretKey, signature)
    }
}