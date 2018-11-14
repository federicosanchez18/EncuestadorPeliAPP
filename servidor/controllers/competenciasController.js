var con = require ('../conexionbd');

var controller = {

    //listo todas las competencias
    buscarCompetencias: function (req, res) {
        var sql = "SELECT * FROM competencia";
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            res.send(JSON.stringify(resultado));

    });},
    
    peliculaAleatoria: function (req, res) {
        var idCompetencia = req.params.id;
        var sql = "SELECT nombre, genero_id, director_id, actor_id FROM competencia WHERE id = " + idCompetencia + ";";
        con.query(sql, function(error, competencia, fields){
            if (error) { 
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            var queryPeliculas = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
            var genero = competencia[0].genero_id;
            var actor = competencia[0].actor_id;
            var director = competencia[0].director_id;
            var queryGenero = genero ? ' AND pelicula.genero_id = '  + genero : '';
            var queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
            var queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
            var randomOrder = ' ORDER BY RAND() LIMIT 2';

            var sql = queryPeliculas + queryGenero + queryActor + queryDirector + randomOrder;

            con.query(sql, function(error, peliculas, fields){
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(500).send("Hubo un error en la consulta");
                }

               var response = {
                    'peliculas': peliculas,
                    'competencia': competencia[0].nombre
                };

                res.send(JSON.stringify(response));
            });
        });
},

    nombreCompetencia: function (req, res){
        var nombreCompetencia = req.params.id;
        var query = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " + nombreCompetencia;
        con.query(query, function(error, resultado){
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            var response = {
                'id': resultado,
                'nombre': resultado[0].nombre,
                'genero_nombre': resultado[0].genero,
                'actor_nombre': resultado[0].actor,
                'director_nombre': resultado[0].director
            }
            res.send(JSON.stringify(response));
        });
    },

     //guardo el voto que recibo
     guardarVoto: function (req,res){
        var idCompetencia= req.params.idCompetencia;
        var idPelicula = req.body.idPelicula;
        var query = "INSERT INTO voto (competencia_id, pelicula_id) values (" + idCompetencia + ", " + idPelicula + ")";
        
        con.query(query, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
            var response = {
                'voto': resultado.insertId,
            };
            res.status(200).send(response);    
        });
    },

    //obtengo las 3 películas más votadas
    obtenerResultados: function (req,res){
        var idCompetencia = req.params.id; 
        var query = "SELECT * FROM competencia WHERE id = " + idCompetencia;
        
        con.query(query, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
    
            if (resultado.length === 0) {
                console.log("No se encontro ninguna competencia con este id");
                return res.status(404).send("No se encontro ninguna competencia con este id");
            }
    
            var competencia = resultado[0];
    
            var query = "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " + idCompetencia + " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3";
    
            con.query(query, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(500).send("Hubo un error en la consulta");
                }
    
                var response = {
                    'competencia': competencia.nombre,
                    'resultados': resultado
                };
               
                res.send(JSON.stringify(response));    
            });             
        });
    },
    
    //permitir la creación de una nueva competencia
    crearNuevaCompetencia: function (req, res){
        
            var nueva_competencia = req.body;
            var nombreCompetencia = nueva_competencia.nombre;
            var filtroValue = "";
            var filtroColumn = "";
            var filtroCriterio = "";
          
            // Agrego filtros si se envía el parámetro genero
            if (nueva_competencia.genero > 0) {
              filtroValue += ", " + nueva_competencia.genero;
              filtroCriterio += " AND g.id = " + nueva_competencia.genero;
              filtroColumn += ", genero_id ";
            }
          
            // Agrego filtros si se envía el parámetro director
            if (nueva_competencia.director > 0) {
              filtroValue +=  ",  " + nueva_competencia.director;
              filtroCriterio += " AND d.director_id = " + nueva_competencia.director;
              filtroColumn += ", director_id "
            }
          
            // Agrego filtros si se envía el parámetro actor
            if (nueva_competencia.actor > 0) {
              filtroValue +=  ",  " + nueva_competencia.actor;
              filtroCriterio += " AND a.actor_id = " + nueva_competencia.actor;
              filtroColumn += ", actor_id "
            }
          
            //Verifico que no haya una competencia creada con el mismo nombre
            var sql = "SELECT nombre FROM competencia WHERE nombre = '" + nombreCompetencia + "';";
            con.query(sql, function (error, resultado, fields){
              if (error) {
                return res.status(404).send("Hubo un error en la consulta1");
              }
              // En caso de que haya una competencia con el mismo nombre se envía el mensaje de error
              if (resultado.length > 0) {
                return res.status(422).send("Ya hay una competencia creada con ese nombre");
              }
          
              //Verifico que haya al menos dos peliculas que cumplan con el criterio elegido
              var sql2 = "SELECT pelicula.titulo, d.director_id, a.actor_id, g.id FROM pelicula" +
                         " JOIN director_pelicula d ON d.pelicula_id= pelicula.id" +
                         " JOIN actor_pelicula a ON a.pelicula_id= pelicula.id " +
                         "JOIN genero g ON g.id = pelicula.genero_id WHERE 1=1 " + filtroCriterio + " LIMIT 2;";
              con.query(sql2, function (error, respuesta, fields){
                if (error) {
                  return res.status(404).send("Hubo un error en la consulta2");
                }
                // En caso de que no haya al menos dos películas que cumplan con el criterio se envía el mensaje de error
                if (respuesta.length < 2) {
                  return res.status(422).send("No hay dos peliculas que cumplan con el criterio para poder crear la competencia");
                }
          
                // Inserto los datos de la competencia la base de datos
                var sql3 = "INSERT INTO competencia(nombre" + filtroColumn + ") VALUES ('" + nombreCompetencia + "'" + filtroValue + ");";
                con.query(sql3, function(error, respuestaCompetencia, fields){
                  if (error) {
                    return res.status(404).send("Hubo un error en la query3");
                  }
          
                  //Devuelvo como respuesta el id de la competencia creada
                  var response = {
                      'competenciaInsertId': respuestaCompetencia.insertId
                  }
                  res.send(JSON.stringify(response));
                });
              });
            })
        },  
    //eliminar votos
    eliminarVotos: function (req, res){
        var idCompetencia = req.params.id;
        var query = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;
        con.query(query, function (error, resultado){
            if (error) {
                console.log("Error al eliminar votos", error.message);
                return res.status(500).send(error);
            }
            console.log("Competencia reiniciada id: " + idCompetencia);
            res.send(JSON.stringify(resultado));
        });
    },

    
    //creo competencias por género
    cargarGeneros: function (req,res){
        var query = "SELECT * FROM genero"
        con.query(query, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar géneros", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //creo competencias por director
    cargarDirectores: function (req,res){
        var query = "SELECT * FROM director"
        con.query(query, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar directores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //creo competencias por actores
    cargarActores: function (req,res){
        var query = "SELECT * FROM actor"
        con.query(query, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar actores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //borro competencias
    eliminarCompetencia: function (req, res) {
        var idCompetencia = req.params.idCompetencia;
        var query = "DELETE FROM competencia WHERE id =" + idCompetencia;
        
        con.query(query, function (error, resultado){
            if(error){
                console.log("Error al eliminar la competencia", error.message);
                return res.status(500).send("Error al eliminar competencia");
            }
            res.send(JSON.stringify(resultado));
        });
    },
               
    //edito las competencias
    editarCompetencia: function (req, res) {
        var idCompetencia = req.params.id;
        var nuevoNombre = req.body.nombre;
        var query = "UPDATE competencia SET nombre = '"+ nuevoNombre +"' WHERE id = "+ idCompetencia +";";
        
        con.query(query,function(error, resultado, fields){
            if(error){
                return res.status(500).send("Error al modificar la competencia")
            }
            if (resultado.length == 0){
                console.log("No se encontro la pelicula buscada con ese id");
                return res.status(404).send("No se encontro ninguna pelicula con ese id");
            } else {
                var response = {
                    'id': resultado
                };
            }
            res.send(JSON.stringify(response));
        });
    }
};

    
module.exports = controller;