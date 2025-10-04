module.exports = {
    name: "dice",
    description: "Lanza un dado de 6 caras.",
    execute(api, event) {
        const result = Math.floor(Math.random() * 6) + 1;
        api.sendMessage(`🎲 ¡Has sacado un ${result}!`, event.threadID);
    }
};