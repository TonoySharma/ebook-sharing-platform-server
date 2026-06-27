const express = require('express');
const dotenv = require("dotenv")
dotenv.config();
const cors = require("cors")
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    
    const ebooksCollection = db.collection("ebooks")
    const subscriptionsCollection = db.collection("subscriptions")
    const userCollection = db.collection("user")
    const purchasedNowCollection = db.collection('PurchasedNow')
    const paymentCollection = db.collection('payment')
    const addedBookCollection = db.collection('addedbook')




    // user pro api
    app.post("/subscription", async (req, res) => {
      const {
        sessionId,
        priceId,
        userId,
      } = req.body;

      const isExist = await subscriptionsCollection.findOne({ sessionId })
      if (isExist) {
        return res.json({ msg: "already exist !" })
      }

      const result = await subscriptionsCollection.insertOne({
        sessionId,
        priceId,
        userId,
      })

      // update user role
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { plan: "pro" } }
      )

      res.json({ msg: "payment successfull !" })

    })

    // purchaes History api
    app.get("/purchases/:email", async (req, res) => {
      const { email } = req.params;
      // console.log(req.params,  'req.params');
      
      const result = await purchasedNowCollection.find({ userEmail: email })
        .sort({ purchasedAt: -1 }).toArray();

      res.send(result);
    });

    // added book api
    app.post("/api/addedbook", async (req, res) => {
      const addedbook = req.body;
      const result = await addedBookCollection.insertOne(addedbook)

      res.send(result);
    })

    // payment api 
    app.post('/payments', async (req, res) => {
      const paymentData = req.body;
      const result = await paymentCollection.insertOne(paymentData);

      res.json(result);

    })

    // PurchasedNow api 1
    app.post("/PurchasedNow", async (req, res) => {
      const purchasedData = req.body;

      // console.log("Received Data:", purchasedData);

      const result = await purchasedNowCollection.insertOne(purchasedData);

      res.json(result);
    })


    //  my PurchasedNow api
    app.get("/PurchasedNow/:userId", async (req, res) => {
      const { userId } = req.params;
      //  console.log(req.params,  'emty');

      const result = await purchasedNowCollection.find({ userId: userId }).toArray();
      //  console.log(result, "Received Data!");

      return res.json(result);
    })


    // PurchasedNow verifyToken api 
    // app.get("/PurchasedNow", verifyToken, async (req, res) => {
    //   try {

    //     const userEmailOrId = req.user?.email || req.user?.id;

    //     if (!userEmailOrId) {
    //       return res.status(401).send({ message: "Unauthorized access" });
    //     }

    //     const query = {
    //       userEmail: userEmailOrId, 
    //       paymentStatus: "success"  
    //     };

    //     const result = await PurchasedNowCollection.find(query).toArray();

    //     res.send(result);
    //   } catch (error) {
    //     res.status(500).send({ message: "Internal server error" });
    //   }
    // });


    // limetaded book api
    app.get("/featuredBook", async (req, res) => {
      const result = await ebooksCollection.find().limit(8).toArray()
      res.send(result)
    });

    //Browse ebooks Api
    app.post("/api/ebooks", async (req, res) => {
      const ebooksData = req.body;
      // console.log(ebooksData);

      const result = await ebooksCollection.insertMany(ebooksData);

      // console.log(result);

      res.json(result);

    })

    // search api 

    app.get("/api/ebooks", async (req, res) => {
      const { page = 1, limit = 10, search = "" } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const query = {};

      if (search && search != "undefiend") {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { writer_name: { $regex: search, $options: "i" } },
        ];
      }

      const result = await ebooksCollection
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .toArray();

      const totalData = await ebooksCollection.countDocuments(query);
      const totalPage = Math.ceil(totalData / Number(limit));

      res.send({
        data: result,
        page: Number(page),
        totalPage,
      });
    });

    // ebooks details api
    app.get('/api/ebooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await ebooksCollection.findOne(query);

      res.json(result);
    })








    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello Bangladesh!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});