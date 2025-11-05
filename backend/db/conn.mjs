import { MongoClient } from "mongodb";
import dotenv from "dotenv";


dotenv.config();


const connectionString = process.env.ATLAS_URI || "";

console.log(connectionString);

const client = new MongoClient(connectionString, {
  tls: true,
  tlsAllowInvalidCertificates: true, //  FIX
    tlsAllowInvalidHostnames: true,  // ADD THIS
  serverSelectionTimeoutMS: 5000,
});

let conn;
try{
    conn = await client.connect();
    console.log('mongoDB is Connected!! :)');
}catch(e) {
    console.error(e);
}

const db = client.db("PaymentSystemDB"); 

export default db;