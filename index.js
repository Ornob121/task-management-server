const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// ! Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("The task management server is running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cpumijq.mongodb.net/?retryWrites=true&w=majority`;

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

    const taskCollection = client.db("task-management").collection("tasks");

    app.get("/tasks", async (req, res) => {
      const localId = req.query.localId;
      const filter = { localId: localId };
      const result = await taskCollection
        .find(filter)
        .sort({
          taskAddingTime: -1,
        })
        .toArray();
      res.send(result);
    });
    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(filter);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      //   console.log(task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.patch("/task/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: {
          taskStatus: "Completed",
        },
      };
      const result = await taskCollection.updateOne(filter, update);
      res.send(result);
    });

    app.patch("/updateTask/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedTask = req.body;
      //   console.log(updatedTask, "hello", id);
      const update = {
        $set: {
          taskName: updatedTask.taskName,
          taskStatus: updatedTask.taskStatus,
          taskDetails: updatedTask.taskDetails,
        },
      };
      const result = await taskCollection.updateOne(filter, update);
      res.send(result);
    });

    // ! Delete API
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(filter);
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

app.listen(port, () => {
  console.log(`The task management server is running on port ${port}`);
});
