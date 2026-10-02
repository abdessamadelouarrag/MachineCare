import User from "../models/users.js"

export async function updateUser(req, res, next){
    try{
        const {name, email} = req.body || {};
        const updates = {};
        if(name === undefined && email === undefined){
            return res.status(400).json({
                message_error : "Aucun champ a modifier !"
            })
        }
        if(name !== undefined){
            if(typeof name !== "string" || !name.trim()){
                return res.status(400).json({
                    message_error : "Nom invalide !"
                })
            }
            updates.name = name.trim();
        }
        if(email !== undefined){
            if(typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())){
                return res.status(400).json({
                    message_error : "Email invalide !"
                })
            }
            updates.email = email.trim().toLowerCase();
            const findUser = await User.findOne({
                email : updates.email,
                _id : {$ne : req.user._id}
            });
            if(findUser){
                return res.status(409).json({
                    message_error : "Email deja utilise !"
                })
            }
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {$set : updates},
            {new : true, runValidators : true}
        ).select("-password");
        if(!user){
            return res.status(404).json({
                message_error : "Utilisateur introuvable !"
            })
        }
        return res.status(200).json({
            message : "Profil modifie.",
            user_update : {
                id : user._id,
                name : user.name,
                email : user.email
            }
        })
    }catch(error){
        next(error);
    }
}

export async function showProfile(req, res){
    return res.status(200).json({
        id : req.user._id,
        name : req.user.name,
        email : req.user.email,
        createdAt : req.user.createdAt
    })
}
