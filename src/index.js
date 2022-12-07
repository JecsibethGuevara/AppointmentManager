const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const SQLiteStore =  require('connect-sqlite3')(session)
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport')
const {BrowserWindow, app} = require('electron')
const url = require ('url')


const win = express();
// app.disableHardwareAcceleration()

win.use(session({
    secret: 'user',
    name: 'sessionId',
    saveUninitialized : true,
    resave : true,
    store: new SQLiteStore({
        table: 'sessions',
        db : 'db.db',
        dir: __dirname
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

win.use(bodyParser.json({limit: '50mb'}));
win.use(bodyParser.urlencoded({limit: '50mb', extended: true}));



win.set('port', process.env.PORT || 4000); // configuracion del puerto
win.set('views', path.join(__dirname, '/views')); // configuracion de la carpeta views (ubicacion)

win.engine('.hbs', handlebars.engine({
    defaultLayout : 'main',
    layoutsDir : path.join(win.get('views'), 'layouts'),
    extname : '.hbs'
}))
win.set('view engine', '.hbs');
win.use(express.json()); 
win.use(express.urlencoded({extended: false}));
win.use(morgan('dev'));
win.use(flash());

win.use(passport.initialize());
win.use(passport.session());

win.use((req, res, next) =>{
    win.locals.success = req.flash('success');
    win.locals.message = req.flash('message');
    win.locals.user = req.user;
    next();
});



win.use(require('./routes/routes'));
win.use('/docs', express.static(path.join(__dirname, '/docs')));
win.use(express.static(path.join(__dirname, '/public')));
//start server
win.listen(win.get('port'), () =>{
    console.log('server on port', win.get('port'));
}) 

let mainWindown = null
function main(){
    mainWindown = new BrowserWindow({
        width: 1000,
        height: 900
    })
    mainWindown.remove
    mainWindown.loadURL('http://localhost:4000/')
}

// app.on('ready', main)