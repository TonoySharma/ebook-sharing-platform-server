const express = require('express');
const dotenv = require("dotenv")
dotenv.config();
const cors = require("cors")
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT;

app.use(cors());
app.use(express.json());



const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// verifyToken,

async function run() {
  try {

    const db = client.db("ebook_db");
    // const purchaseHistoryCollection = db.collection("purchase-history")
    const ebooksCollection = db.collection("ebooks")

    // lemetaded book api
    app.get("/featuredBook", async (req, res) => {
      const result = await ebooksCollection.find().limit(6).toArray()
      res.send(result)
    });
    // ebooks Api
    app.get('/api/ebooks', async (req, res) => {
      const cursor = ebooksCollection.find();
      const result = await cursor.toArray();

      res.send(result);


    })


















    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello Bangladesh!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});