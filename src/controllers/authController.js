import User from "../models/users.js"
import bcrypt from "bcryptjs"

export async function register(req, res, next){
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                message_error : "le nom et email et le mot de pass et obligation !"
            })
        }

        const toLowerEmail = email.trim().toLowerCase();
        const userIn = await User.findOne({ email : toLowerEmail});

        if(userIn){
            return res.status(400).json({
                message_error : "l'email deja utiliser !"
            })
        }

        //hash mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // creer le compte
        const newUser = User.create({
            name : name,
            email : toLowerEmail,
            password : hashedPassword
        })

        return res.status(200).json({
            message_success : "Compte Créé",
            user : {id : newUser._id , name : newUser.name, email : newUser.email} 
        })

    }catch(error){
        next(error);
    }
}

