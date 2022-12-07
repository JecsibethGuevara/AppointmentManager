const  helpers = require('../lib/Helpers.js');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

const db = require('../db')

let date = new Date();
const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
let time = `${date.getHours() - date.getMinutes()}`
passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    await db.all('SELECT * FROM users WHERE username = ?', username, (err, rows) =>{
        if(err) return console.error(err.message);
        
      
    
   
    if(rows.length > 0){
        const user = rows[0] 
        console.log(user, 'row')
        const validPassword =  helpers.matchPassword(password, user.password)
        if (validPassword){
            sqlII=[`${d} -- ${time}`, user.username, 'login', 122] 
            db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES (?,?,?,?)', sqlII)
            done(null, user, req.flash('success','Bienvenido' + user.username))
        } else{ done(null, false, req.flash('message','Contrasena invalida'));}
    }else{
        return done(null, false, req.flash('message','Usuario Invalido'));
    }
    })
}
))



passport.use('signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    let {name, admin} = req.body
    admin = admin === 'on' ? true : false
    const newUser = [
        name,
        username,
        password,
        admin
    ];
    newUser[2] = await helpers.encryptPassword(password)
    let sql ='INSERT INTO users(nombre, username, password, admin) VALUES (?,?,?,?)'
    const result = db.all(sql, newUser)

    sqlII=[`${d} -- ${time}`, newUser[1], 'createUser', 800] 
    db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES (?,?,?,?)', sqlII)

    let sqll ='SELECT id FROM users ORDER BY id DESC LIMIT (?)'
    db.all(sqll, 1,(err, rows)=>{
        if (err) return console.error(err.message);
        newUser.id = rows[0].id
        return done(null, newUser) 
}) 
}
))

passport.serializeUser((user, done) => {
    done(null, user.id);
});

    passport.deserializeUser(async(id, done)=>{
        await db.all('SELECT * FROM users WHERE id = ?', id, (err, rows) =>{
            if (err) return console.error(err.message);
            done(null, rows[0]);
        })
        
    });