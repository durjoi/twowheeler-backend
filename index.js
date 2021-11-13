const { MongoClient } = require("mongodb");

const express = require('express');
require('dotenv').config();
var cors = require('cors')

const { ObjectId } = require('mongodb');



const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());
app.use(cors())


// Replace the uri string with your MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oznqi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri);


async function run() {
    try {
        await client.connect();
        const database = client.db("twowheelers");
        const bicycleCollection = database.collection("bicycles");
        const userCollection = database.collection("user");
        const ordersCollection = database.collection("orders");

        // Get All the bicycles
        app.get('/bicycles', async (req, res) => {

            if(req.query?.limit) {
                const limit = parseInt(req.query.limit);
                const bicycles = await bicycleCollection.find({}).limit(limit);

                if (await bicycles.count() == 0) {
                    console.log('No Result Found');
                }

                bicycles.toArray(function(err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(JSON.stringify(result));
                    }
                });
            } else {
                const bicycles = await bicycleCollection.find({})

                if (await bicycles.count() == 0) {
                    console.log('No Result Found');
                }

                bicycles.toArray(function(err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(JSON.stringify(result));
                    }
                });
            }
            

        });

        // Get Event by id
        app.get('/bicycles/:id', async(req, res) => {

            const id = ObjectId(req.params.id);

            const query = { _id: id };

            const bicycles = await bicycleCollection.find(query);

            if (await bicycles.count() == 0) {
                console.log('No Result Found');
            }

            bicycles.toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(JSON.stringify(result));
                }
            });

        });


        // delete Event by id
        app.delete('/bicycles/:id', async(req, res) => {

            const id = ObjectId(req.params.id);

            const query = { _id: id };

            const bicycles = await bicycleCollection.deleteOne(query);

            if (bicycles.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }

            res.send("Deleted Successfully");

        });

        // Insert an Event
        app.post('/bicycles', async(req, res) => {
            const newEvent = req.body;
            const result = await bicycleCollection.insertOne(newEvent);
            console.log(`A document was inserted in Bicycle Collection with the _id: ${result.insertedId}`);

            res.send(result.insertedId);
        });



        // Get all the orders
        app.get('/orders', async(req, res) => {
            const orders = await ordersCollection.find({});

            if (await orders.count() == 0) {
                console.log('No Result Found');
            }

            orders.toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(JSON.stringify(result));
                }
            });
        });

        // Insert new Booking
        app.post('/orders', async(req, res) => {
            const newOrder = req.body;

            console.log(req.body);

            const result = await ordersCollection.insertOne(newOrder);
            console.log(`A document was inserted in Booking Collection with the _id: ${result.insertedId}`);

            res.send(result.insertedId);
        });

        // delete Booking by id
        app.delete('/orders/:id', async(req, res) => {

            const id = ObjectId(req.params.id);

            const query = { _id: id };

            const booking = await ordersCollection.deleteOne(query);

            if (booking.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }

            res.send("Deleted Successfully");

        });

        // Update status by id
        app.put('/orders/:id', async(req, res) => {

            const id = ObjectId(req.params.id);
            const status = req.query.status;

            const query = { _id: id };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    status: status
                },
            };

            const booking = await ordersCollection.updateOne(query, updateDoc);



            res.send("Updated Successfully");

        });


        // Get orders by User Id
        app.get('/orders/:userid', async(req, res) => {
            const query = { user_id: req.params.userid };

            const orders = await ordersCollection.find(query);

            if (await orders.count() == 0) {
                console.log('No Result Found');
            }

            orders.toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(JSON.stringify(result));
                }
            });

        });



        // Get Event by id
        app.get('/users', async(req, res) => {
            
            const email = req.query.email;

            const query = { email: email };

            const user = await userCollection.find(query);

            user.toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(JSON.stringify(result));
                }
            });

        });


        // Add new user
        app.post('/users', async(req, res) => {
            const newUser = req.body;
            console.log(req.body);
            const result = await userCollection.insertOne(newUser);
            console.log(`A document was inserted in Event Collection with the _id: ${result.insertedId}`);

            res.send(result.insertedId);
        });

        // Add new user
        app.post('/user/admin', async(req, res) => {
            const userEmail = req.body.email;

            console.log(userEmail);

            const filter = { email: userEmail };

            const updateDoc = {
                $set: {
                  role: "Admin"
                },
              };

            const result = await userCollection.updateOne(filter, updateDoc);

            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
              );


            // console.log(req.body);
            // const result = await userCollection.insertOne(newUser);
            // console.log(`A document was inserted in Event Collection with the _id: ${result.insertedId}`);

            res.send(result);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`TwoWheeler Backend Server Listening at http://localhost:${port}`);
})