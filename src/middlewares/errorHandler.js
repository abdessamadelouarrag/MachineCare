export function errorHandler(error, req, res, next){
    if(res.headersSent){
        return next(error);
    }

    if(error.code === 11000){
        return res.status(409).json({message_error : "Email ou reference deja utilise !"})
    }

    if(error.name === "VersionError"){
        return res.status(409).json({message_error : "Signalement modifie entre-temps. Rechargez avant de reessayer !"})
    }

    if(error.name === "ValidationError" || error.name === "CastError"){
        return res.status(400).json({message_error : error.message})
    }

    if(error.status === 400){
        return res.status(400).json({message_error : "Requete JSON invalide !"})
    }

    console.error(error);
    return res.status(500).json({message_error : "Erreur interne du serveur !"})
}
