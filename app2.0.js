const {Client} = require('whatsapp-web.js');
const qrcode = require ('qrcode-terminal');
const path = require('path');
const { strict } = require('assert');
const { Console } = require('console');


const client = new Client();
let REG = []; // Arreglo para almacenar los números registrados
let N_REG = []; // Arreglo para almacenar los números no registrados


//Definicion de la ruta donde se encuentran el archivo para los envios masivos
const route = path.dirname('D:/NewTool/Archivos/SUBIDA MASIVA.xlsx' + path.join('/SUBIDA MASIVA.xlsx'))
console.log (route);

client.initialize();

//Metodo para generar el codigo qr
client.on ('qr', (qr)=>{
    console.log ('QR:',qr)
    qrcode.generate(qr,{small:true})
});


//Cuando se logra la conexion entrara en el siguiente bloque de codigo.
client.on ('ready', ()=>{
    console.log('Nueva sesion creada')

    client.on ('message_create', async (msg) => {
        console.log ('sended:',msg.body + "\n"+"Enviado por mi:" + msg.fromMe)     
        console.log(msg.body)
        //!MASIVO es la palabra clave para el empezar el envio
        //msj.body.trim()
        if (msg.fromMe){
            console.log("Check-N-2")
    
            //Apartir de aqui se trabajara con el excel con la lista de números a verificar
            const readerS = require ('xlsx');  
            //IndicadorMasivo = true
            
             //Se definen las las variables para leer el archivo excel
            const dat = readerS.readFile(route);
            let sheet_name_list= dat.SheetNames
            let xlData = readerS.utils.sheet_to_json(dat.Sheets[sheet_name_list[0]])
            //console.log (xlData)
    
            //Se recorre el arreglo que tiene la informacion del excel
            console.log("Total de números a verificar: ")
            console.log(xlData.length)
            console.log("Listado de números a verificar:")
            
            //Variable utilizadas en el momento que se recorre el excel
            //let i = 0;
            let j = 0;

            for (let D of xlData){
                await delay(5000); // Espera 5 segundos antes de cada iteración
                console.log(D.NUMERO)
                let number = '506' + D.NUMERO
                number = number.split(" ").join("")
                let chatid =  number + "@c.us"
                let IDMSJ = D.IDMSG
                let now = new Date()
                let fecha = now.toLocaleDateString()
                j = j+1;
                //por cada recorrido al arreglo se verifica que el numero este registrado en whatsapp
                client.isRegisteredUser(chatid).then(function(isRegistered) {
                    if(isRegistered) {
                        //Si se envia el mensaje, se guarda dentro del arreglo de Registrados
                        REG.push({IDMS:IDMSJ, Numero:number, Hora: fecha,});                               
                    }else{
                        //Si NO esta registrado, se guarda dentro del arreglo de No Registrados
                        N_REG.push({IDMS:IDMSJ, Numero:number, Hora: fecha,});
                    }
                });
            }
            generarReporte();

        }
    });//fin de la funcion client.on     
});

function generarReporte(){
    setTimeout(() => {
        if (REG.length > 1) {
            //Despues de recorrer el arreglo con la totalidad de los masivos se genera el informe de envio
            let reader = require ('xlsx')
            let exc = reader.utils.book_new()
            let workSheet1 = reader.utils.json_to_sheet(REG)
            let workSheet2 = reader.utils.json_to_sheet(N_REG)
            reader.utils.book_append_sheet(exc, workSheet1, 'REGISTRADO EN WHATSAPP')
            reader.utils.book_append_sheet(exc, workSheet2, 'NO REGISTRADO EN WHATSAPP')
            reader.writeFile(exc, 'D:/NewTool/Reportes/REPORTE ENVÍO.xlsx');                                  
            while (REG.length > 0){
                REG.splice(0, REG.length);
            }
            while (N_REG.length > 0){
                N_REG.splice(0, N_REG.length);
            }                          
        }
        // crea un nuevo objeto `Date`
        let fecha_actual = new Date();
        // obtener la fecha y la hora
        let now = fecha_actual.toLocaleString();
        console.log("###################################################")
        console.log("####-Informe Generado-####")
        console.log("fecha de creacion de informe: " +now)
        console.log("###################################################"+"\n\n")                     
    }, 3000);//se indica que la funcion se ejecutará despues de 3 segundos
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
