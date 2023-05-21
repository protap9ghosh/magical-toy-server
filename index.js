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
      client.connect();

      const toyCollection = client.db("toyDB").collection("toy");

      // find all toy
      app.get("/toy", async (req, res) => {
         const cursor = toyCollection.find().limit(20);
         const result = await cursor.toArray();
         res.send(result);
      });

      // find a specific toy collection
      app.get("/toy/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const options = {
            projection: { category: 0 },
         };
         const result = await toyCollection.findOne(query, options);
         res.send(result);
      });

      // get myToys
      app.get("/myToys/:email", async (req, res) => {
         const email = req.params.email;
         const query = { sellerEmail: email };
         const result = await toyCollection.find(query).toArray();
         res.send(result);
      });

      // toy category
      app.get("/subCategory/:categorys", async (req, res) => {
         if (
            req.params.categorys == "Cat" ||
            req.params.categorys == "dog" ||
            req.params.categorys == "horse"
         ) {
            const result = await toyCollection
               .find({ category: req.params.categorys })
               .toArray();
            return res.send(result);
         }
         const result = await toyCollection.find({}).toArray();
         return res.send(result);
      });

      // insert a toy
      app.post("/toy", async (req, res) => {
         const newToy = req.body;
         console.log(newToy);
         const result = await toyCollection.insertOne(newToy);
         res.send(result);
      });

      // update specific toy details
      app.put("/toy/:id", async (req, res) => {
         const id = req.params.id;
         const filter = { _id: new ObjectId(id) };
         const options = { upsert: true };
         const updatedToy = req.body;
         const toyInfo = {
            $set: {
               toyName: updatedToy.toyName,
               photo: updatedToy.photo,
               price: updatedToy.price,
               quantity: updatedToy.quantity,
               details: updatedToy.details,
            },
         };
         const result = await toyCollection.updateOne(filter, toyInfo, options);
         res.send(result);
      });

      // delete toy
      app.delete("/toy/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await toyCollection.deleteOne(query);
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
