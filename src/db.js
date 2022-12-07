const sqlite3 = require('sqlite3').verbose()
const path = require('path');

let sql
const db = new sqlite3.Database(path.join(__dirname, 'db.db'), sqlite3.OPEN_READWRITE, (err)=>{
    if(err) return(console.error(err.message));
    console.log('connected')
});

sql = `SELECT * FROM sessions`
db.run(sql, [], (err, rows) =>{
    if (err) return console.error(err.message);

    
})
module.exports = db