import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

export async function connectDb(){
    const MongoDB = process.env.MONGO_URI;

    if(!MongoDB){
        throw new Error("le variable mongo uri introuvable!");
    }

    await mongoose.connect(MongoDB);

    console.log("connection db good...");
}