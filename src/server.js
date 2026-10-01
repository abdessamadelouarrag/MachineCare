import express from "express"
import {connectDb} from "./config/db.js";
import "dotenv/config";
import authRouter from "./routes/authRouter.js"
import dashboardRouter from "./routes/dashboardRouter.js"
import machineRouter from "./routes/machineRouter.js"
import profileRouter from "./routes/profileRouter.js"

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) =>{
    res.json({
        message : "Welcome To Machine Care"
    })
})

app.use("/api/auth", authRouter);
app.use("/api/", dashboardRouter);
app.use("/api/machines", machineRouter);
app.use("/api/profile", profileRouter);


async function startServer(){
    try{
        await connectDb();
        app.listen(port, () =>{
            console.log(`=> Server start in port ${port}`)
        })
    }catch(error){
        console.log(error);
    }
}

startServer();
