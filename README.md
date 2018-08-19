# MOBA Matchup

A web application aim to solve imbalance private MOBA matches within group of friends an colleagues

## Features
- Keep track of players rating based on previous matches results
- Auto balance team within the input group of players based on player rating
- Announce games in LINE with bot

## WebUI

    GET /*

Get request to any path except `/api/*` and `/static/` will return `index.html` to support SPA route

    GET /static/*

Will serve anything under `public/` directory

## LINE Bot
To enable LINE annoucer bot you have to create your bot in your LINE developer console then set these environment variables

    LINE_SECRET_KEY=your-bot-secret-key-from-the-developer-console-page
    LINE_ACCESS_TOKEN=your-bot-access-token-generated-from-the-developer-console-page
    HOST_NAME=host.name.you.deployed.your.application.to

Make sure to `Use webhooks` and `allow bot to join group chats`

Webhook URL

    POST /api/line-webhook


## API
### Players
#### list

    GET /api/players

Returns list of players in the system

#### detail

    GET /api/players/<playerId>

Returns single player object

#### create

    POST /api/players

    {
      "name": <player name>,
      "rating": <optional initial rating>
    }

Create new player in the system with optional initial rating (default to 0)

### Games
#### list

    GET /api/games

Returns list of games

#### detail

    GET /api/games/<gameId>

Returns single game object

#### create

    POST /api/games

    {
      "playerIds": [
        ....,
        ....,
        ....
      ]
    }

Create a new game and auto assign players from playerIds input to both team based on each player rating

#### submit result

    POST /api/games/<gameId>/submit

    {
      "winner": <0 or 1 depends on which team wins>
    }

Submit game result, This will increase rating of every players on the winning side and decrease rating of every players on the other side

#### cancel

    POST /api/games/<gameId>/cancel

If somehow accidently create a game and don't want to play, use this endpoint to cancel the game, no payload needed

## Development Guide

### Developed with
- TypeScript
- Koa
- official MongoDB driver
- Mocha
- Vue
- Webpack

### Requirements
- NodeJS with version > 7.6.0 (only tested with 8.2.1)
- MongoDB

### How to run
- Set `MONGO_URI` environment variable to your MongoDB database (defaulted to mongodb://localhost:27017/moba)
- `yarn install`
- `yarn build` to compile typescript and run webpack
- `yarn start` this start the koa server
- visit your server at http://localhost:3000/

### How to run unit test
- `yarn test`
- IMPORTANT, your local mongodb at `mongodb://localhost:27017/moba-test` will be dropped and use for testing
