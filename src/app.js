
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser"; // iska kaam itna ki main user ki browser par cookies set bhi kar pau aur excess bhi kar pau

const app = express()

// app.use(cors())  // majorly isse kaamho jaata hain
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    // see more options from documentation and explore

}))

app.use(express.json({
    limit: '16kb'
})) //json apke forms ka data leta hain 
app.use(express.urlencoded({ extended: true, limit: "16kb" })) // url ko config karta hain 
app.use(express.static("public"))
app.use(cookieParser())



//Routes import 
import userRouter from "./routes/user.routes.js"

//routes decleration 
app.use("/api/v1/users",userRouter)



export { app }
