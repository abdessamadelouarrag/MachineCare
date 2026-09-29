import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : [true, "email et obligatoir"],
        unique : true,
        trim : true,
        match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse email valide"]
    },
    password : {
        type : String,
        required : [true, "obligation le mot de pass"],
        minlength : [6, "min 6 caracteres"]
    }
},{
    timestamps : true
});

const User = mongoose.model('users', usersSchema);

export default User;