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
    // const purchaseHistoryCollection = db.collection("purchase-history")
    const ebooksCollection = db.collection("ebooks")
    const subscriptionsCollection = db.collection("subscriptions")
    const userCollection = db.collection("user")



    // user pro api
    app.post("/subscription", async (req, res) => {
      const{
        sessionId,
        priceId,
        userId,
      } = req.body;

      const isExist = await subscriptionsCollection.findOne({sessionId})
      if(isExist){
        return res.json({msg: "already exist !"})
      }

      const result = await subscriptionsCollection.insertOne({
        sessionId,
        priceId,
        userId,
      })

      // update user role
      await userCollection.updateOne(
       {_id: new ObjectId(userId)},
       {$set: {plan: "pro"}}
      )

      res.json({msg: "payment successfull !"})



    })




    // limetaded book api
    app.get("/featuredBook", async (req, res) => {
      const result = await ebooksCollection.find().limit(8).toArray()
      res.send(result)
    });

    //Browse ebooks Api
    app.get('/api/ebooks', async (req, res) => {
      const {page=1, limit=10}= req.query;
      const skip = (Number(page) -1 )* Number(limit)
      // {userId: req.user.id}
      const result = await ebooksCollection.find().skip(skip).limit(Number(limit)).toArray();
      const totalData = await ebooksCollection.countDocuments();
      const totalPage = Math.ceil(totalData/Number(limit))
     

      res.send({data: result, page:Number(page), totalPage});
    })

    app.post("/api/ebooks", async (req, res) =>{
      const ebooksData = req.body;
      // console.log(ebooksData);

      const result = await ebooksCollection.insertMany(ebooksData);

      // console.log(result);
      
      res.json(result);
      
    })

    // ebooks details api
    app.get('/api/ebooks/:id', async(req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await ebooksCollection.findOne(query);

        res.send(result);
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