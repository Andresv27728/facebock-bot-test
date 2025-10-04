module.exports = {
    name: "ping",
    description: "Responde con 'Pong!' para verificar si el bot está activo.",
    execute(api, event) {
        api.sendMessage("Pong!", event.threadID);
    }
};