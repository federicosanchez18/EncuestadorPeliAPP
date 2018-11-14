var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var controller = require('./controllers/competenciasController');
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Pedidos a la base de datos (primero query params)
app.get('/generos', controller.cargarGeneros);
app.get('/directores', controller.cargarDirectores);
app.get('/actores', controller.cargarActores);

app.get('/competencias/:id/peliculas', controller.peliculaAleatoria);
app.post('/competencias/:idCompetencia/voto', controller.guardarVoto);
app.get('/competencias/:id/resultados', controller.obtenerResultados);
app.get('/competencias/:id', controller.nombreCompetencia);
app.get('/competencias', controller.buscarCompetencias);

app.post('/competencias', controller.crearNuevaCompetencia);
app.put('/competencias/:id', controller.editarCompetencia);

app.delete('/competencias/:id/votos', controller.eliminarVotos);
app.delete('/competencias/:idCompetencia', controller.eliminarCompetencia);


const puerto = 8080;


app.listen(puerto,() => {
    console.log("Escuchando en el puerto" + puerto)
});