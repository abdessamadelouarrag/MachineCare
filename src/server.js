import express from "express"
import {connectDb} from "./config/db.js";
import dotenv from "dotenv";

const port = process.env.PORT || 3000;

const app = express();

async function startServer(){
    try{
        await connectDb();
        app.listen(port, () =>{
            console.log(`server start in port ${port}`)
        })
    }catch(error){
        console.log(error);
    }
}

startServer();
