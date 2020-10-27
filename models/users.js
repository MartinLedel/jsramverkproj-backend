const db = require("../db/database.js");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let config;
try {
    config = require('../config/config.json');
} catch (error) {
    console.error(error);
}
const jwtSecret = process.env.JWT_SECRET || config.secret;

const mongo = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:27017';

async function insertToCollection(colName, email) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.insertOne({
        email: email,
        balance: 0,
        stocks: [
            {
                stockname: 'AMZN',
                qty: 0,
            },
            {
                stockname: 'MSFT',
                qty: 0,
            },
            {
                stockname: 'AAPL',
                qty: 0,
            },
            {
                stockname: 'GOOG',
                qty: 0,
            },
        ]
    });
    console.log(
      `${res.insertedCount} documents were inserted with the _id: ${res.insertedId}`,
    );
    await client.close();

    return res;
}

const users = {
    login: function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    detail: "Email or password missing in request"
                }
            });
        }

        let sql = "SELECT * FROM users WHERE email = ?";

        db.get(
            sql,
            email,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (rows === undefined) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            detail: "User with provided email not found."
                        }
                    });
                }

                const user = rows;

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                detail: "bcrypt error"
                            }
                        });
                    }

                    if (result) {

                        let payload = { email: user.email };
                        let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                        return res.json({
                            data: {
                                status: 200,
                                type: "success",
                                message: "User logged in",
                                user: payload,
                                token: jwtToken
                            }
                        });
                    }

                    return res.status(401).json({
                        errors: {
                            status: 401,
                            detail: "Password is incorrect."
                        }
                    });
                });
            });
    },
    register: function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    detail: "Email or password missing in request"
                }
            });
        }

        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        detail: "bcrypt error"
                    }
                });
            }

            db.run("INSERT INTO users (email, password) VALUES (?, ?)",
                email,
                hash, (err) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }
                    try {
                        insertToCollection('userStocks', email);
                    } catch (err) {
                        console.log(err);
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }
                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                });
        });
    },
};

module.exports = users;
