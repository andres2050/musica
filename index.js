var fpcalc = require("fpcalc");
var request = require('request-promise');
var glob = require("glob");
var readline = require('readline');
require('console.table');


var idClient = "DZQCRv06EA";
var apiUrl = "https://api.acoustid.org/v2/lookup";
var musica = [];
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


pedirInformacion();

function buscarCanciones(canciones) {
    if(canciones.length === 0){
        pedirInformacion();
        return;
    }
    //se genera el fingerprint de las canciones
    fpcalc(canciones[0], function (err, result) {
        if (err) throw err;
        //se genera una peticion post al servicio web
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
                        //se acamoda la informacion para obtener todos los resultados en caso de ser mas de uno
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
                //cuando termina se revisa si es la ultima cancion o si hay mas en la lista
                if(canciones.length === 1){
                    console.table(musica);
                    pedirInformacion();
                }else{
                    //en casode haber mas se le pasa el resto de la lista
                    canciones.shift();
                    buscarCanciones(canciones);
                }

            });
    });
}

function examinarDirectorio(directorio) {
    //examina todos los archivos mp3 del directorio dado
    glob(directorio + "/*.mp3", function (er, files) {
        buscarCanciones(files);
    })
}

function pedirInformacion() {
    //se pide la ruta en la que se desea ver la informacion, solo se han probado las rutas de linux
    rl.question("Ingrese el directorio de sus archivos .mp3 \n", function (ruta) {
        if (ruta === ""){
            pedirInformacion()
        }else{
            console.log("Este proceso tardara dependiendo de la cantidad de archivos que tenga en la ruta.");
            examinarDirectorio(ruta);
        }
    })
}
