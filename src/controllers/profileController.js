export async function showProfile(req, res){
    return res.status(200).json({
        id : req.user._id,
        name : req.user.name,
        email : req.user.email,
        createdAt : req.user.createdAt
    })
}