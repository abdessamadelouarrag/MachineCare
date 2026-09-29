import User from "../models/users.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

export async function login(req, res, next) {
    try{

        const {email, password} = req.body;
    
        if(!email || !password){
            res.satus(400).json({
                message_error : "obligation de email et mot de pass !"
            })
        }
    
        const emailToLower = email.trim().toLowerCase();
        const findUser = await User.findOne({email : emailToLower});
    
        if(!findUser){
            res.status(404).json({
                message_error : "il n'est pas un utilisateur avec l'email ! (Allez a Register)"
            })
        }
    
        const deHashPassword = findUser && await bcrypt.compare(password, findUser.password);
    
        // creation de token jwt
        const token = jwt.sign({sub : findUser._id.toString()}, process.env.JWT_SECRET, {expiresIn : '1h'})
    
        return res.status(201).json({
            token : token,
            user : {name : findUser.name},
            message : "login bien G"
        })
    }catch(error){
        next(error);
    }
}