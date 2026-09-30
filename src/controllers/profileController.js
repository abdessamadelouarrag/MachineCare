import User from "../models/users.js"

export async function updateUser(req, res){
    const {name, email} = req.body

    if(!name || !email){
        return res.status(400).json({
            message_error : "obligation touts les champs !"
        })
    }

    const findUser = await User.findOne({email : email});

    if(!findUser){
        return res.status(400).json({
            message_error : "accune utilisateur avec se email !"
        })
    }

    const updateUser = await User.updateOne({name : findUser.name}, {$set: {name : name}})

    return res.status(201).json({
        message : "vous avez update profile ...",
        user_update : {name : name}
    })
}

export async function showProfile(req, res){
    return res.status(200).json({
        id : req.user._id,
        name : req.user.name,
        email : req.user.email,
        createdAt : req.user.createdAt
    })
}