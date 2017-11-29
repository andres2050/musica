var fpcalc = require("fpcalc");
var request = require('request-promise');
require('console.table');


var idClient = "DZQCRv06EA";
var apiUrl = "https://api.acoustid.org/v2/lookup";
var musica = [];


function buscarCanciones(canciones) {
    if(canciones.length === 0){
        return;
    }
    fpcalc(canciones[0], function (err, result) {
        if (err) throw err;
        request.post(
            {
                uri: apiUrl,
                form: {
                    client: idClient,
                    duration: result.duration,
                    fingerprint: result.fingerprint,
                    meta: "recordings"
                },
                json: true
            })
            .then(function (body) {
                for (var i in body.results) {
                    for (var j in body.results[i].recordings) {
                        var Artistas = "";
                        for (var k in body.results[i].recordings[j].artists) {
                            if (Artistas !== "") {
                                Artistas += ", "
                            }
                            Artistas += body.results[i].recordings[j].artists[k].name;
                        }
                        musica.push(
                            {
                                Cancion: body.results[i].recordings[j].title,
                                Duracion: body.results[i].recordings[j].duration,
                                Artistas: Artistas
                            }
                        );
                    }
                }
            })
            .error(function (error) {
                throw error;
            })
            .finally(function () {
                if(canciones.length === 1){
                    console.table(musica);
                }else{
                    buscarCanciones(canciones.shift());
                }

            })
    });
}


buscarCanciones(["./Cull.mp3"]);