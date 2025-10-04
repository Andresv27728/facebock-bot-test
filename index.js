const fs = require("fs");
const login = require("facebook-chat-api");
require('dotenv').config();

// --- Cargar Credenciales y Comandos ---
const email = process.env.FB_EMAIL;
const password = process.env.FB_PASSWORD;
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

// --- Lógica de Inicio de Sesión ---
function performLogin(loginOptions) {
    login(loginOptions, (err, api) => {
        if (err) {
            // Si el error es por un appState inválido, se reintenta con credenciales
            if (loginOptions.appState && err.errorID !== '368') { // 368 es error de credenciales
                console.warn("El inicio de sesión con appState ha fallado. Reintentando con email y contraseña...");
                // Eliminar el archivo appstate corrupto o expirado para forzar un nuevo inicio de sesión
                if (fs.existsSync(appStatePath)) fs.unlinkSync(appStatePath);
                return performLogin({ email, password });
            }

            // Si el error persiste, es un problema con las credenciales o la cuenta
            console.error("Error definitivo en el inicio de sesión:", err.error);
            if (err.error === 'Login approval needed.') {
                console.log("CONSEJO: Habilita la autenticación de dos factores (2FA) en tu cuenta de Facebook para mayor seguridad y estabilidad.");
            } else if (err.error === 'Wrong username or password.') {
                console.error("ERROR: El email o la contraseña son incorrectos. Revisa tu archivo .env.");
            }
            return; // Detener la ejecución si el login falla
        }

        // --- Inicio de Sesión Exitoso ---
        console.log("¡Inicio de sesión exitoso!");
        fs.writeFileSync(appStatePath, JSON.stringify(api.getAppState()));
        console.log("Estado de la sesión (appstate.json) guardado correctamente.");

        api.setOptions({ listenEvents: true, logLevel: "silent" });

        // --- Listener de Mensajes ---
        api.listen((err, event) => {
            if (err) return console.error("Error en el listener:", err);

            if (event.type === "message" && event.body) {
                // Ignorar mensajes del propio bot para evitar bucles infinitos
                if (event.senderID === api.getCurrentUserID()) return;

                console.log(`Mensaje de ${event.senderID}: "${event.body}"`);

                const args = event.body.trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                const command = commands.get(commandName);

                if (command) {
                    // Si el mensaje coincide con un nombre de comando, se ejecuta
                    try {
                        console.log(`Ejecutando comando: ${commandName}`);
                        command.execute(api, event, args, commands);
                    } catch (error) {
                        console.error(`Error al ejecutar el comando '${commandName}':`, error);
                        api.sendMessage("Hubo un error al procesar tu comando.", event.threadID);
                    }
                } else {
                    // Si no es un comando, el bot actúa como un "eco"
                    console.log("No es un comando, respondiendo con eco.");
                    api.sendMessage(event.body, event.threadID);
                }
            }
        });
    });
}

// --- Iniciar el Bot ---
console.log("Iniciando el bot...");
try {
    if (fs.existsSync(appStatePath)) {
        console.log("Se encontró appstate.json. Intentando iniciar sesión con estado guardado...");
        const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
        performLogin({ appState });
    } else {
        console.log("No se encontró appstate.json. Iniciando sesión con credenciales (email/contraseña)...");
        performLogin({ email, password });
    }
} catch (e) {
    console.error("No se pudo leer o parsear appstate.json. Se eliminará y se usarán credenciales.", e);
    if (fs.existsSync(appStatePath)) fs.unlinkSync(appStatePath);
    performLogin({ email, password });
}