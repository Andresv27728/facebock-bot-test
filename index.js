const fs = require("fs");
const login = require("fca-unofficial");
require('dotenv').config();

// --- Cargar Comandos ---
const appStatePath = "appstate.json";
const commands = new Map();

console.log("Cargando comandos desde la carpeta 'plugins'...");
fs.readdirSync('./plugins').filter(file => file.endsWith('.js')).forEach(file => {
    try {
        const command = require(`./plugins/${file}`);
        commands.set(command.name, command);
        console.log(`-> Comando cargado: ${command.name}`);
    } catch (error) {
        console.error(`No se pudo cargar el comando desde ${file}:`, error);
    }
});

// --- Lógica de Inicio de Sesión (basada en cookies) ---
console.log("Iniciando el bot...");

if (!fs.existsSync(appStatePath)) {
    console.error("ERROR CRÍTICO: No se encuentra el archivo 'appstate.json'.");
    console.error("Este archivo es necesario para iniciar sesión con las cookies de tu cuenta.");
    console.error("Por favor, sigue las instrucciones para obtenerlo y colócalo en la misma carpeta que 'index.js'.");
    process.exit(1); // Detener la ejecución si no hay credenciales
}

login({ appState: JSON.parse(fs.readFileSync(appStatePath, 'utf8')) }, (err, api) => {
    if (err) {
        console.error("Error definitivo en el inicio de sesión:", err);
        if (err.error === 'Not logged in.') {
            console.error("CONSEJO: El archivo 'appstate.json' puede haber expirado o ser inválido. Por favor, genéralo de nuevo.");
        }
        return process.exit(1);
    }

    // --- Inicio de Sesión Exitoso ---
    console.log(`¡Inicio de sesión exitoso! Conectado como ID: ${api.getCurrentUserID()}`);

    // El appstate se actualiza automáticamente por la librería, no es necesario reescribirlo.

    api.setOptions({ listenEvents: true, logLevel: "silent" });

    // --- Listener de Mensajes ---
    const listener = api.listen((err, event) => {
        if (err) {
            console.error("Error en el listener, reconectando...", err);
            // La librería intentará reconectar automáticamente.
            return;
        }

        if (event.type === "message" && event.body) {
            // Ignorar mensajes del propio bot para evitar bucles infinitos
            if (event.senderID === api.getCurrentUserID()) return;

            console.log(`Mensaje de ${event.senderID}: "${event.body}"`);

            const args = event.body.trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);

            if (command) {
                try {
                    console.log(`Ejecutando comando: ${commandName}`);
                    command.execute(api, event, args, commands);
                } catch (error) {
                    console.error(`Error al ejecutar el comando '${commandName}':`, error);
                    api.sendMessage("Hubo un error al procesar tu comando.", event.threadID);
                }
            } else {
                // Lógica de eco
                console.log("No es un comando, respondiendo con eco.");
                api.sendMessage(event.body, event.threadID);
            }
        }
    });
});