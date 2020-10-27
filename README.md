# Setup

## Clone repo
`git clone https://github.com/MartinLedel/jsramverkproj-backend.git`
## Install dependencies
`npm install`
## Start api server
`node app.js`
## Access api at:
`localhost:1337`

## Technologies
This API runs on express. Bcryptjs together with jsonwebtoken makes registering a user more secure.
Sqlite3 is used when registering and logging in a user with the client. MongoDB stores the stock data
relevant to the stocks and the users.
