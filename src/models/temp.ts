import { MongoClient, ObjectId } from "mongodb";
import assert from "assert";

const url = "mongodb://your-mongodb-url"; 
const dbName = "your-database-name"; 
const collectionName = "your-collection-name"; 

const agg = [
  {
    $match: {
      product: new ObjectId("61cb37a03fa09364278edd21"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
];


MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  async (connectErr, client) => {
    assert.equal(null, connectErr);
    
    try {
      const db = client.db(dbName);
      const coll = db.collection(collectionName);

      const result = await coll.aggregate(agg).toArray();
      console.log(result);
    } catch (cmdErr) {
      console.error(cmdErr);
    } finally {
      client.close();
    }
  }
);
