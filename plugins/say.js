module.exports = {
    name: "say",
    description: "Hace que el bot repita un mensaje.",
    execute(api, event, args) {
        if (args.length === 0) {
            api.sendMessage("Debes escribir algo para que yo lo diga.", event.threadID);
            return;
        }
        const messageToSay = args.join(" ");
        api.sendMessage(messageToSay, event.threadID);
    }
};