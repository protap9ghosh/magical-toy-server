const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrk8jch.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      const toyCollection = client.db("toyDB").collection("toy");

      app.get("/toy", async (req, res) => {
         const cursor = toyCollection.find();
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get("/toy/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const options = {
            projection: { category: 0 },
         };
         const result = await toyCollection.findOne(query, options);
         res.send(result);
      });


      // insert a toy
      app.post("/toy", async (req, res) => {
         const newToy = req.body;
         console.log(newToy);
         const result = await toyCollection.insertOne(newToy);
         res.send(result);
      });

      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log(
         "Pinged your deployment. You successfully connected to MongoDB!"
      );
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("Magical Toy is running...");
});

app.listen(port, () => {
   console.log(`Magical Toy is running on port ${port}`);
});
