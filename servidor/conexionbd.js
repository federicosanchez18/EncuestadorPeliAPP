var mysql = require('mysql');

var connection = mysql.createConnection({
        host : 'localhost',
        port : 3306,
        user : 'fede',
        password : 'root',
        database :'competencias'
})

module.exports = connection;