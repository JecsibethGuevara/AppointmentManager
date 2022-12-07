const express = require('express')
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport')
const {isLoggedIn, isNotLogged, isAdmin} = require('../lib/auth.js')
const test = require('../lib/passport.js')
const db = require('../db');
const { Router } = require('express');
const {generatePdf}  = require('../lib/controllers');
const { generatePdfEmpty } = require('../lib/controllersEmpty.js');

let date = new Date();
const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
const dbd = `${date.getFullYear()}-${date.getMonth() + 1}-${ date.getDate() < 10 ? `0${date.getDate()}`:date.getDate() }`
console.log(dbd)
const h = `${date.getHours()} - ${date.getMinutes()}`
let daytime 

    if (date.getHours() < 11){
        daytime = 'Buenos Dias'
    }else if(date.getHours() > 11 && date.getHours() < 13){
        daytime = 'Buen Dia'
    } else if(date.getHours() > 12 && date.getHours() < 19){
        daytime = 'Buenas Tardes'
    }else{
        daytime ='Buenas Noches'
    }

let time = `${date.getHours() - date.getMinutes()}`
 
router.get('/', async (req, res) =>{
    await db.all(`SELECT * FROM users`,[], (err, rows) =>{
        if(err) return console.error(err.message);
        if(rows.length > 0){
           res.render('portals/login'); 
        }else{
            res.redirect('/registrar')
        }
})
})

router.post('/', passport.authenticate('login', {
    successRedirect: '/Home',
    failureRedirect: '/',
    failureFlash: true
})
)

router.get('/Home', isLoggedIn,  async (req, res) =>{
    const indexObject =[{
        tiempo : daytime,
        usuario : req.user.username,
        nombre: req.user.nombre,
        hora : time
    }]

    let limit =3
    await db.all(`SELECT * FROM citas WHERE active = ? AND fecha = ? ORDER BY hora ASC LIMIT ?  `,[ 'active',dbd, limit], (err, rows) =>{
        if(err) return console.error(err.message);
        console.log(rows)
        res.render('portals/Index', {rows, indexObject });
    })
    
})

router.get('/nuevoPaciente',isLoggedIn, async (req, res) =>{
    res.render('portals/newPatient');
})

router.post('/nuevoPaciente', async (req, res) =>{
    const newPaciente = [req.body.cedula, req.body.nombre, req.body.apellido, req.body.edad, req.body.fecha, req.body.sexo, req.body.estadoCivil, req.body.ocupacion]
    const newPacienteContact = [req.body.cedula, req.body.telefono, req.body.direccion, req.body.telefonoOficina, req.body.direccionOficina, req.body.email, req.body.seguro, req.body.representante]
    const newPacienteHistoria = [req.body.cedula, req.body.patologias, req.body.motivoConsulta]
    const newConsulta = [req.body.cedula, req.user.nombre, d, req.body.Observaciones]
    const log = [d, req.user.username, 'insertPatient', '244' ]
    console.log(req.body.fecha)
    try{
        const sql = `INSERT INTO pacientes(cedula, nombre, apellido, edad, fechaNac, sexo, estadoCivil, ocupacion) VALUES(?,?,?,?,?,?,?,?)`
        const result = await db.all(sql, newPaciente)  
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO pacientesContact(cedula, telefono, direccion, telefonoOficina, direccionOficina, email, seguro, representante) VALUES(?,?,?,?,?,?,?,?)`
        const result = await db.all(sql, newPacienteContact)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO pacientesHistoria(cedula, patologias, motivoConsulta) VALUES(?,?,?)`
        const result = await db.all(sql, newPacienteHistoria)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO consultas(cedula, nombreDr, fechaConsulta, Observaciones) VALUES(?,?,?,?)`
        const result = await db.all(sql, newConsulta)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO log(fecha, nombre, action, actionId) VALUES(?,?,?,?)`
        const result = await db.all(sql, log)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO historiaDocs(cedula) VALUES(?)`
        const result = await db.all(sql, req.body.cedula)
       
    } catch (e) {console.error(e.message)}
    
    res.redirect('/Pacientes/1') 
})  

router.get('/Pacientes/:id', isLoggedIn, async (req, res) =>{
    let {id} = req.params
    id = parseInt(id)
    let limit = 11
    let offset = 11 * (id - 1)
    await db.all(`SELECT * FROM pacientes LIMIT ? OFFSET ?`,[limit, offset], (err, rows) =>{
        if(err) return console.error(err.message);
        if(rows.length == 11 && id == 1){
            let newId = [{
                id : id+1,
                prevId: 'disabled'
            }]
            res.render('portals/pacientes', {rows, newId});
        } else if(id > 1 && rows.length == 11){
            let newId = [{
                id : id+1,
                prevId: id -1
            }]
            res.render('portals/pacientes', {rows, newId});
        } else if(rows.length < 11 && id > 1){
            let newId = [{
                id : 'disabled',
                prevId: id -1
            }]
            res.render('portals/pacientes', {rows, newId});
        }else if(id==1 && rows.length < 11){
            let newId = [{
                id : 'disabled',
                prevId:'disabled'
            }]
            res.render('portals/pacientes', {rows});
        }
        
        
    })
    
})

router.get('/Paciente/:id', isLoggedIn, async (req, res) =>{
    let sql = `SELECT pacientes.cedula, nombre, apellido, edad, sexo, fechaNac, ocupacion, estadoCivil, telefono, direccion,telefonoOficina, direccionOficina, email, seguro, representante, patologias, motivoConsulta FROM pacientes INNER JOIN pacientesContact ON pacientes.cedula = pacientesContact.cedula INNER JOIN pacientesHistoria ON pacientes.cedula = pacientesHistoria.cedula WHERE pacientes.cedula = (?)`
    let sqlv = `SELECT fechaConsulta, Observaciones FROM consultas WHERE cedula = ?`
    let result = []
    const {id} = req.params;
    await db.all(sql,id, (err, rows) =>{
        if(err) return console.error(err.message);
        db.all(sqlv, id, (err, result)=>{
            if(err) return console.error(err.message);
            console.log(result)
        res.render('portals/patientProfile', {rows, result});
        })
        
    })
    
})

router.get('/editPaciente/:cedula', isLoggedIn, async (req,res)=>{
    const {cedula} =req.params;
    console.log(cedula)
    let sql = `SELECT pacientes.cedula, nombre, apellido, estadoCivil, ocupacion, edad, sexo, telefono, direccion, telefonoOficina, direccionOficina, email, seguro, representante, patologias, motivoConsulta, fechaConsulta, Observaciones FROM pacientes INNER JOIN pacientesContact ON pacientes.cedula = pacientesContact.cedula INNER JOIN pacientesHistoria ON pacientes.cedula = pacientesHistoria.cedula INNER JOIN consultas ON consultas.cedula = pacientes.cedula WHERE pacientes.cedula = (?)`
    await db.all(sql,cedula, (err, rows) =>{
        if(err) return console.error(err.message);
        console.log(rows)
        res.render('portals/editPatient', {rows});
    })
})

router.post('/editPaciente/:id', isLoggedIn, async (req,res)=>{
    console.log(req.body.fecha)
    const newPaciente = [req.body.cedula, req.body.nombre, req.body.apellido, req.body.edad, req.body.fecha, req.body.sexo, req.body.estadoCivil, req.body.ocupacion]
    const newPacienteContact = [req.body.cedula, req.body.telefono, req.body.direccion, req.body.telefonoOficina, req.body.direccionOficina, req.body.email, req.body.seguro, req.body.representante]
    const newPacienteHistoria = [req.body.cedula, req.body.sangre, req.body.patologias, req.body.motivoConsulta]
    const newConsulta = [req.body.cedula, req.user.nombre, d, req.body.Observaciones]
    const log = [d, req.user.username, 'editPatient', '466' ]
    try{
        const sql = `UPDATE pacientes SET nombre = '${newPaciente[1]}', apellido = '${newPaciente[2]}' , edad = ${newPaciente[3]}, fechaNac = '${newPaciente[4]}', sexo = '${newPaciente[5]}', estadoCivil = '${newPaciente[6]}', ocupacion = '${newPaciente[7]}' WHERE cedula = '${req.params.id}'`
        const result = await db.all(sql)
        console.log(sql)
    } catch (e) {console.error(e.message)} 
    try{
        const sql = `UPDATE pacientesContact SET telefono = ${newPacienteContact[1]}, direccion = '${newPacienteContact[2]}' , telefonoOficina = ${newPacienteContact[3]}, direccionOficina = '${newPacienteContact[4]}' , email = '${newPacienteContact[5]}', seguro = '${newPacienteContact[6]}', representante ='${newPacienteContact[7]}' WHERE cedula = '${req.params.id}'`
        const result = await db.all(sql)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `UPDATE pacientesHistoria SET sangre = '${newPacienteHistoria[1]}', patologias = '${newPacienteHistoria[2]}' , motivoConsulta = '${newPacienteHistoria[3]}' WHERE cedula = '${req.params.id}'`
        const result = await db.all(sql)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `UPDATE consultas SET fechaConsulta = '${newConsulta[2]}', Observaciones = '${newConsulta[4]}' WHERE cedula = '${req.params.id}' `
        const result = await db.all(sql)
       
    } catch (e) {console.error(e.message)} 
    try{
        const sql = `INSERT INTO log(fecha, nombre, action, actionId) VALUES(?,?,?,?)`
        const result = await db.all(sql, log)
       
    } catch (e) {console.error(e.message)} 
    
    res.redirect('/Pacientes/1')
})

router.get('/deletePaciente/:cedula', isLoggedIn, async(req, res) =>{
    const {cedula} = req.params
    const log = [d, req.user.username, 'deletePatient', '688' ]
    sql = 'DELETE FROM pacientes WHERE cedula = ?'
    sqlI =  'DELETE FROM pacientesContact WHERE cedula = ?'
    sqlIII =  'DELETE FROM pacientesHistoria WHERE cedula = ?'
    sqlIV =  'DELETE FROM consultas WHERE cedula = ?'
    sqlV = 'DELETE FROM historiaDocs WHERE cedula = ?'
    await db.all(sql,cedula)
    await db.all(sqlI,cedula)
    await db.all(sqlIII,cedula)
    await db.all(sqlIV,cedula)
    await db.all(sqlV, cedula)
    await db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES(?,?,?,?)', log)
    res.redirect('/pacientes/1')

})

router.get('/log/:id', isLoggedIn, async(req,res)=>{
    if(req.user.admin == 1){
        let {id} = req.params
    id = parseInt(id)
    let limit = 10
    let offset = 10 * (id - 1)
    await db.all(`SELECT * FROM log LIMIT ? OFFSET ?`, [limit, offset], (err, rows) =>{
        if(err) return console.error(err.message);
        if(rows.length ==10 && id ==1){

            let newId = [{
                id : id+1,
                prevId: 'disabled'
            }]

            sqlII=[d, req.user.username, 'visitedLog', 1072] 
            db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES (?,?,?,?)', sqlII)
            console.log('Log updated 10 patients printed', rows.length)
            res.render('portals/log', {rows, newId});
            
        }else if(rows.length == 10 && id > 1){
            let newId = [{
                id : id+1,
                prevId: id -1
            }]
            console.log('10 patients printes', rows.length)
            res.render('portals/log', {rows, newId});
        }else if(rows.length < 10 && id > 1 ){
            let newId = [{
                id: 'disabled',
                prevId : id - 1
            }]
            console.log('btn diabled patients printed')
            res.render('portals/log', {rows, newId});
        }else if(id == 1 && rows.length < 10){
            let newId = [{
                id: 'disabled',
                prevId : 'disabled'
            }]
            res.render('portals/log', {rows});
        }
         
    })
    }else {
        res.redirect('/permissionError')
    }
})

router.get('/Users/:id',isLoggedIn, async(req,res)=>{
    if(req.user.admin == 1){
        let {id} = req.params
    id = parseInt(id)
    let limit = 11
    let offset = 11 * (id - 1)
    await db.all(`SELECT id, nombre, username, admin FROM users WHERE id != ? LIMIT ? OFFSET ?`,[1, limit, offset], (err, rows) =>{
        if(err) return console.error(err.message);
        if(id==1 && rows.length ==11){
            let newId = [{
                id : id+1,
                prevId: 'disabled'
            }]
            res.render('portals/Users', {rows, newId});
        }else if(id > 1 && rows.length ==11 ){
            let newId = [{
                id : id+1,
                prevId: id -1
            }]
            res.render('portals/Users', {rows, newId});
        }else if(id > 1 && rows.length < 11){
            let newId = [{
                id : 'disabled',
                prevId: id -1
            }]
            res.render('portals/Users', {rows, newId});
        }else if(id == 1 && rows.length < 11){
            let newId = [{
                id : 'disabled',
                prevId: 'disabled'
            }]
            res.render('portals/Users', {rows});
        }
        
    })
    } else{
        res.redirect('/permissionError')
    }
})

router.get('/registrar',isLoggedIn, (req,res) =>{
    res.render('portals/registrar')
})

router.get('/deleteUser/:id',isLoggedIn, async(req,res)=>{
    const {id} = req.params;
    const log = [d, req.user.username, 'deleteUser', '1048' ]
    await db.all('DELETE FROM users WHERE id = ?',id)
    await db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES(?,?,?,?)', log)
    res.redirect('/logout')
})

router.get('/logout',isLoggedIn, async function(req, res, next) {
    sqlII=[d, req.user.nombre, 'logout', 1096] 
    db.all('INSERT INTO log(fecha, nombre, action, actionId) VALUES (?,?,?,?)', sqlII)
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

router.post('/registrar', isLoggedIn, isAdmin, passport.authenticate('signin',{
    successRedirect: '/logout',
    failureRedirect: '/registrar',
    failureFlash: true
}))

router.get('/consulta/:id', isLoggedIn, async(req, res)=>{
    let sql = `SELECT pacientes.cedula, nombre, apellido, edad, sexo, fechaNac, telefono, direccion, email, seguro, representante, sangre, patologias, motivoConsulta FROM pacientes INNER JOIN pacientesContact ON pacientes.cedula = pacientesContact.cedula INNER JOIN pacientesHistoria ON pacientes.cedula = pacientesHistoria.cedula WHERE pacientes.cedula = (?)`
    let sqlv = `SELECT fechaConsulta, Observaciones FROM consultas WHERE cedula = ?`
    let result = []
    const {id} = req.params;
    await db.all(sql,id, (err, rows) =>{
        if(err) return console.error(err.message);
        db.all(sqlv, id, (err, result)=>{
            if(err) return console.error(err.message);
            console.log(result)
        res.render('portals/Consulta', {rows, result});
        })
        
    })
})

router.post('/nuevaConsulta/:id',isLoggedIn, async(req,res)=>{
    const newConsulta = [req.params.id, req.user.nombre, d, req.body.Observacion]
    try{
        const sql = `INSERT INTO consultas(cedula, nombreDr, fechaConsulta, Observaciones) VALUES(?,?,?,?)`
        const result = await db.all(sql, newConsulta)
       
    } catch (e) {console.error(e.message)}
    res.redirect(`/Paciente/${req.params.id}`)
})

router.get('/citas/:id', async(req,res) =>{
    let {id} = req.params
    id = parseInt(id)
    let limit = 11
    let offset = 11 * (id - 1)
    await db.all(`SELECT * FROM citas WHERE active = ? LIMIT ? OFFSET ?  `,[ 'active', limit, offset], (err, rows) =>{
        if(err) return console.error(err.message);
        if(id==1 && rows.length ==11){
            let newId = [{
                id : id+1,
                prevId: 'disabled'
            }]
            res.render('portals/Citas', {rows, newId});
        }else if(id > 1 && rows.length ==11 ){
            let newId = [{
                id : id+1,
                prevId: id -1
            }]
            res.render('portals/Citas', {rows, newId});
        }else if(id > 1 && rows.length < 11){
            let newId = [{
                id : 'disabled',
                prevId: id -1
            }]
            res.render('portals/Citas', {rows, newId});
        }else if(id == 1 && rows.length < 11){
            let newId = [{
                id : 'disabled',
                prevId: 'disabled'
            }]
            res.render('portals/Citas', {rows});
        }
        
    })
})

router.get('/nuevaCita', (req, res)=>{
    res.render('portals/nuevaCita')
})

router.post('/nuevaCita', async(req,res)=>{
    const nuevaCita = [req.body.fecha, req.body.hora, req.body.nombre, req.body.area, 'active']
    const log =[d,req.user.nombre, 'createCita', 1218]
    try{
        const sql = `INSERT INTO citas(fecha, hora, nombre, area, active) VALUES(?,?,?,?,?)`
        const result = await db.all(sql, nuevaCita)
       
    } catch (e) {console.error(e.message)}
    try{
        const sql = `INSERT INTO log(fecha, nombre, action, actionId) VALUES(?,?,?,?)`
        const result = await db.all(sql, log)
       
    } catch (e) {console.error(e.message)}
    res.redirect(`/citas/1`)
})

router.get('/deactivate/:id', async(req,res)=>{
    const {id} = req.params
    try{
         const sql =  `UPDATE citas SET active = 'inactive' WHERE id = ${id}`
        const result = await db.all(sql)
       
    } catch (e) {console.error(e.message)} 
   
    res.redirect('/citas/1')
})

router.get('/download/:id', generatePdf);

router.get('/downloadEmpty', generatePdfEmpty)

/** db **/

router.get('/database', async(req,res)=>{
    let sql ='SELECT * FROM company ORDER BY id DESC LIMIT 1'
    await db.all(sql,[],(err, rows)=>{
        if(err) return console.error(err.message);
        res.render('portals/database', {rows})
    } )
    
})

router.get('/template', (req,res)=>{
    res.render('portals/templateEmpty')
})
/** db **/
router.get('/permissionError',(req,res)=>{
    res.render('portals/permissionError')
})

router.get('/siteData', (req , res)=>{
    res.render('portals/editData')
})

router.post('/editData', async(req,res)=>{
    const newData = [req.body.nombre, req.body.direccion, req.body.rif, req.body.otros]
    let sql = 'INSERT INTO company (nombre, direccion, rif, otros) VALUES (?,?,?,?)'
    await db.all(sql, newData, (err, rows)=>{
        if (err) return console.error(err.message);
        res.redirect('/database')
    })
})  

/*** AJAX */

router.get('/cedulas/:CI', async(req,res)=>{
    const {CI} =req.params
    await db.all('SELECT cedula FROM pacientes WHERE cedula = ?', CI, (err, rows)=>{
        if(err) return console.error(err.message);
        res.send(rows)
    } )
})
router.get('/usernames/:username', async(req,res)=>{
    const {username} =req.params
    await db.all('SELECT username FROM users WHERE username = ?', username, (err, rows)=>{
        if(err) return console.error(err.message);
        res.send(rows)
    } )
})
router.get('/observaciones/:id', async(req,res)=>{
    const {id} =req.params
    await db.all('SELECT fechaConsulta, Observaciones FROM consultas WHERE cedula = ?', id, (err, rows)=>{
        if(err) return console.error(err.message);
        res.send(rows)
    } )
})
router.get('/pacientesSearch/:id', async(req,res)=>{
    const {id} =req.params
    let sql = `SELECT * FROM pacientes WHERE cedula LIKE '${id}%'`
    console.log(sql)
    await db.all(sql,[], (err, rows)=>{
        if(err) return console.error(err.message);
        res.send(rows)
    } )
})


module.exports = router;