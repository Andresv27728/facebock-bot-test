module.exports = {
    name: "coinflip",
    description: "Lanza una moneda (cara o cruz).",
    execute(api, event) {
        const result = Math.random() < 0.5 ? "Cara" : "Cruz";
        api.sendMessage(`🪙 Ha salido: ¡${result}!`, event.threadID);
    }
};