const mongo = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:27017';

async function findInCollection(colName, criteria, projection) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(1).toArray();

    await client.close();

    return res;
}

async function updateInCollection(colName, criteria, projection) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    await col.updateOne(
        criteria,
        projection
    );
    await client.close();
}

const stock = {
    userOverview: async function(req, res) {
        try {
            let result = await findInCollection(
                'userStocks',
                { email: req.params.email },
                { stocks: 1, balance: 1 }
            );
            console.log(result)

            return res.status(200).json({
                data: result
            });
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
    },
    getBalance: async function(req, res) {
        try {
            let result = await findInCollection(
                'userStocks',
                { email: req.params.email },
                { balance: 1 }
            );
            console.log(result)

            return res.status(200).json({
                data: result
            });
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
    },
    addBalance: async function(req, res) {
        try {
            await updateInCollection(
                'userStocks',
                { email: req.body.email },
                { $inc: { balance: parseInt(req.body.balance) } }
            );

            let result = await findInCollection(
                'userStocks',
                { email: req.body.email },
                { balance: 1 }
            );

            console.log(result);
            return res.status(200).json({
                data: result
            });
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
    },
    searchStock: async function(req, res) {
        try {
            let result = await findInCollection(
                'stocks',
                { $or: [ { stock: req.body.search }, { stockname: req.body.search } ] },
                {}
            );
            console.log(result)

            return res.status(200).json({
                data: result
            });
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
    },
    buyStock: async function(req, res) {
        let stockResult = [];
        let totalPrice = 0;

        try {
            let result = await findInCollection(
                'stocks',
                { $or: [ { stock: req.body.stock }, { stockname: req.body.stock } ] },
                {}
            );
            console.log(result)
            stockResult = result;
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

        try {
            await updateInCollection(
                'stocks',
                { stockname: req.body.stock },
                { $inc: { qty: -parseInt(req.body.amount) } }
            );

            await updateInCollection(
                'userStocks',
                {
                    email: req.body.email,
                    'stocks.stockname': req.body.stock,
                },
                { $inc: {
                    'stocks.$.qty': parseInt(req.body.amount),
                    balance: -(
                        stockResult[0].startingPoint * parseInt(req.body.amount)
                    ),
                } }
            );

            return res.status(200).json({
                msg: "Bought stock",
            });
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
    },
    sellStock: async function(req, res) {
        let stockResult = [];
        let totalPrice = 0;

        try {
            let result = await findInCollection(
                'stocks',
                { $or: [ { stock: req.body.stock }, { stockname: req.body.stock } ] },
                {}
            );
            console.log(result)
            stockResult = result;
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

        try {
            await updateInCollection(
                'stocks',
                { stockname: req.body.stock },
                { $inc: { qty: parseInt(req.body.amount) } }
            );

            totalPrice = stockResult.startingPoint * req.body.amount;

            await updateInCollection(
                'userStocks',
                {
                    email: req.body.email,
                    'stocks.stockname': req.body.stock,
                },
                { $inc: {
                    'stocks.$.qty': -parseInt(req.body.amount),
                    balance: +(
                        stockResult[0].startingPoint * parseInt(req.body.amount)
                    ),
                } }
            );

            return res.status(200).json({
                msg: "Sold stock",
            });
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
    },
};

module.exports = stock;
