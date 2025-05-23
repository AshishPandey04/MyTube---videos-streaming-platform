// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: './env'
})


const port = process.env.PORT || 8001
connectDB() // return a promise isliye use .then and .catch se impliment kiya hain, .then matalb agar ho gya toh kya hoga and .catch me error
  .then(() => {
    app.on("error", (error) => {
      console.log("Error ::", error)
      throw error

    })
    app.listen(port, () => {
      console.log(`Server is running at port at ${port}`)
    })
  })
  .catch((error) => {
    console.log("MongoDB connection failed :: ", error);

  })














































// always remember to use async await and try and catch when connecting to database as the database may be in different continent and it may take time to connect and use try and catch so that we can handle connection failed
// First approach to connect db and run then or connect to them when the index file runs or system starts .
// connecting it in index file makes the index file unsystematic thus we will prefer 2nd approach that is by having a connection function is db folder and then executing it in index file 

/*

import express from "express";
const app = express();



;(async ()=>{
  try {
   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
   app.on("error",(error)=>{
    console.log("Error:",error);
    throw error;
    
   })
   app.listen(process.env.PORT,()=>{
    console.log(`App is listening on port : ${process.env.PORT}`);
    
   })
    
  } catch (error) {
    console.error("ERROR:",error)
    throw err 
    
  }
})()
  */