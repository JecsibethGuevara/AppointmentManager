const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const options = require('./options');
const db = require('../db');




const generatePdf = async (req, res, next) => {
        const html = fs.readFileSync(path.join(__dirname, '../views/portals/template.hbs'), 'utf-8');
        const filename = Math.random() + '_doc' + '.pdf';
        const {id} = req.params
        let sql = `SELECT pacientes.cedula, nombre, apellido, fechaNac, edad, sexo, telefono, direccion, email, seguro, representante, sangre, patologias, motivoConsulta FROM pacientes INNER JOIN pacientesContact ON pacientes.cedula = pacientesContact.cedula INNER JOIN pacientesHistoria ON pacientes.cedula = pacientesHistoria.cedula WHERE pacientes.cedula = (?)`
        let sqlVI = `SELECT fechaConsulta, Observaciones FROM consultas WHERE cedula = (?)`
        let sqlVII ='SELECT id FROM historiaDocs WHERE cedula = (?)'
        await db.all(sql, id, (err, rows)=>{
            if(err) return console.error(err.message);
            db.all(sqlVI, id, (err, result)=>{
                if(err) return console.error(err.message);
                db.all(sqlVII, id, (err, nroHistoria)=>{

               
                
                const document = {
                    html: html,
                    data: {
                        rows: rows,
                        result : result,
                        empresa: nroHistoria,
                    },
                    path: './src/docs/' + filename
                    
                    }
                    
                    pdf.create(document, options)
                        .then(res => {
                             
                        }).catch(error => {
                            console.log(error, 'error');
                        });
                        const filepath = 'http://localhost:4000/docs/' + filename;

                        res.render('download', {
                            path: filepath
                        });



            })
            

        })
        
        })

        
}


module.exports = {
    generatePdf
}