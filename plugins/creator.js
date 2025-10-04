module.exports = {
    name: "creator",
    description: "Muestra el creador del bot.",
    execute(api, event) {
        api.sendMessage("Fui creado por Jules, un asistente de IA.", event.threadID);
    }
};