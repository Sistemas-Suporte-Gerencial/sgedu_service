const tokenFree = [];

const validToken = (req, res, next) => {
    if (!tokenFree.includes(req.path)) 
        if(!req.headers.authorization === process.env.TOKEN) 
            return res.status(401).json({error: 'Unauthorized'}); 

    next();
}

export default validToken;