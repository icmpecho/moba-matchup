import { LineService } from "../../services/line"
import { Config } from "../../services/config"
import { assert } from "../helper"
import { mock } from "ts-mockito"
import { Service as ModelService } from "../../models"

describe('LineService', () => {
    const models = mock(ModelService)

    describe('#isEnable', () => {
        context('line access token is not set', () => {
            const config = new Config("", 3000, "secret", "")
            const service = new LineService(config, models)
            it('return false', () => {
                assert.equal(false, service.isEnable)
            })
        })

        context('line secret is not set', () => {
            const config = new Config("", 3000, "", "token")
            const service = new LineService(config, models)
            it('return false', () => {
                assert.equal(false, service.isEnable)
            })
        })

        context('line access token and secret is set', () => {
            const config = new Config("", 3000, "secret", "token")
            const service = new LineService(config, models)
            it('return true', () => {
                assert.equal(true, service.isEnable)
            })
        })
    })

    describe('#validateSignature', () => {
        const config = new Config("", 3000, "secret", "token")
        const service = new LineService(config, models)
        it('validate the signature agaist body', () => {
            const result = service.validateSignature("signature", '{"foo": "bar"}')
            assert.equal(false, result)
        })
    })
})
