module.exports = {
    name: "time",
    description: "Muestra la hora actual del servidor.",
    execute(api, event) {
        const currentTime = new Date().toLocaleTimeString('es-ES');
        api.sendMessage(`🕒 La hora actual es: ${currentTime}`, event.threadID);
    }
};