const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    console.log(hash);
    return hash;
};

helpers.matchPassword = async (password, savedPassword) =>{
    try{
        return await bcrypt.compare(password, savedPassword)
     
    } catch(e){
        console.log(e);
    }
};


helpers.encryptPassword = async (passwordadmin)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(passwordadmin, salt);
    console.log(hash);
    return hash;
};

helpers.matchPassworda = async (passwordadmin, savedPassword) =>{
    try{
        return await bcrypt.compare(passwordadmin, savedPassword)
     
    } catch(e){
        console.log(e);
    }
};

module.exports = helpers;