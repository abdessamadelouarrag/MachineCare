import User from "../models/users.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function logout(req, res, next){
    try{
        // changer la version pour refuser les anciens tokens
        const updateUser = await User.updateOne(
            {_id : req.user._id},
            {$inc : {tokenVersion : 1}}
        )

        if(!updateUser.matchedCount){
            return res.status(401).json({
                message_error : "utilisateur introuvable !"
            })
        }

        return res.status(200).json({
            message : "Deconnexion reussie."
        })
    }catch(error){
        next(error);
    }
}

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
        const newUser = await User.create({
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
            return res.status(400).json({
                message_error : "obligation de email et mot de pass !"
            })
        }
    
        const emailToLower = email.trim().toLowerCase();
        const findUser = await User.findOne({email : emailToLower});
    
        if(!findUser){
            return res.status(401).json({
                message_error : "il n'est pas un utilisateur avec l'email ! (Allez a Register)"
            })
        }
    
        const deHashPassword = findUser && await bcrypt.compare(password, findUser.password);

        if(!deHashPassword){
            return res.status(401).json({
                message_error : "invalide mot de pass !"
            })
        }
    
        // creation de token jwt
        const token = jwt.sign({
            sub : findUser._id.toString(),
            tokenVersion : findUser.tokenVersion ?? 0
        }, process.env.JWT_SECRET, {expiresIn : '1h'})
    
        return res.status(201).json({
            token : token,
            user : {name : findUser.name},
            message : "login bien G"
        })
    }catch(error){
        next(error);
    }
}

export async function defaultUser(req, res){
    try{
        const passwordTest = "admin123";
        const emailTest = "admin@owner.cc"
        const hashPassword = await bcrypt.hash(passwordTest, 10)
        
        const findUser = await User.findOne({email : emailTest})

        if(findUser){
            return res.status(400).json({
                message_error : "le default compte et deja creer !",
                info_default_user : {email : emailTest, password : passwordTest}
            })
        }
        const defaultUser = await User.create({
            name : "admin",
            email : emailTest,
            password : hashPassword
        })

    
        return res.status(201).json({
            message : "default compte est creer ...",
            info_user_pour_login : {email : emailTest, password : passwordTest}
        })
    }catch(error){
        res.status(404).send(error)
    }
}
