const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const options = require('./options');
const db = require('../db');





const generatePdfEmpty = async (req, res, next) => {
        const html = fs.readFileSync(path.join(__dirname, '../views/portals/templateEmpty.hbs'), 'utf-8');
        const filename = Math.random() + '_doc' + '.pdf';

        await db.all('INSERT INTO historiaDocs(cedula) VALUES (0)')
        db.all('SELECT id FROM historiaDocs ORDER BY id DESC LIMIT 1', [], (err, rows)=>{
            
        
                const document = {
                    html: html,
                    path: './src/docs/' + filename,
                    
                    data : {
                        rows: rows
                    },
                    }
                    pdf.create(document, options)
                        .then(res => {
                            console.log(res,'ok');
                        }).catch(error => {
                            console.log(error, 'error');
                        });
                        const filepath = 'http://localhost:4000/docs/' + filename;

                        res.render('download', {
                            path: filepath
                        });

                    })

                }


module.exports = {
    generatePdfEmpty
}