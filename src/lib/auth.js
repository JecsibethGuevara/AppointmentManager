module.exports ={
    isLoggedIn(req, res, next){
        if (req.isAuthenticated()){
            return next();
        }
        return res.redirect('/');
    },

    isAdmin(req,res, next){
        if(req.user.admin == 1){
            console.log('yeah')
            return next();
        }else{
            console.log('noh')
            return res.redirect('/404')
        }
        
    },
    //Para que no vea el registro o se registre otra vez, si esta iniciado el usuario
    isNotLoggedIn(req, res, next){
        if (!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/')
    }
};