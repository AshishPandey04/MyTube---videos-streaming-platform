
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

import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes decleration 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export { app }
