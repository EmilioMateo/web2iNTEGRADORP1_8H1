    const mysql = require('mysql2');
    require('dotenv').config();

    const conexion = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD
    });

    conexion.connect((error) =>{
        if (error){
            console.log('Error al conectar', error);
            return;
        }
        console.log('Conexión exitosa');
    })

    module.exports = conexion;