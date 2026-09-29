import {mongoose} from "mongoose";
import express, { json } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const MongoDB = process.env.MONGO_URI;

mongoose.connect(MongoDB).then(() => {
    console.log("ahh db khdama ta9 amarch !!");
    app.listen(PORT, () =>{
        console.log(`server start in port ${PORT}`);
    })
}).catch((error) => console.log(error));

const diffUsers = new mongoose.Schema({
    name : String,
    age : Number
})

const modelUser = mongoose.model('users', diffUsers);

async function createNewUsers(req, res) {
    try{
        const {name, age} = req.body;

        const newUser = new modelUser({
            name : name,
            age : age
        })
        const saveUser = await newUser.save();
        res.status(201).send("created success !");
    }catch(error){
        console.log(error);
    }
}

async function findUser(req, res) {
    try{
        const {age} = req.body;
        const findUser = await modelUser.find({ age : age})
        if(findUser.length > 0){
            res.status(201).json(findUser, {
                totalOfUsers : findUser.length
            });
        }else{
            res.status(404).json({
                message : "not found any user with this age"
            })
        }
    }catch(error){
        console.log(error);
    }
}

async function deleteUser(req, res){
    try{
        const {name} = req.body;
        const deleteUser = await modelUser.deleteMany({name : name});
        res.status(201).json({
            message : `you delete users with name : ${name}`
        })
    }catch(error){
        console.log(error);
    }
}

async function updateUser(req, res){
    try{
        const {name} = req.body;
        const updateUser = await modelUser.updateOne({name : name}, {$set : {age : 11}});
        if(updateUser.matchedCount === 0){
            return res.status(404).json({
                message : "no user with this name"
            })
        }
        res.status(200).json({
            message : `you are update info of user : ${name}`
        })
    }catch(error){
        console.log(error)
    }
}


// part dyal route
app.post("/newUser", createNewUsers);
app.get("/findUser", findUser)
app.delete("/deleteUser", deleteUser);
app.patch("/updateUser", updateUser);