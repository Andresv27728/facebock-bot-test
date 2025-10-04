module.exports = {
    name: "menu",
    description: "Muestra la lista de comandos disponibles.",
    execute(api, event, args, commands) {
        let menuMessage = "📜 *Menú de Comandos*\n\n";
        commands.forEach(command => {
            menuMessage += `*${command.name}*: ${command.description}\n`;
        });
        api.sendMessage(menuMessage, event.threadID);
    }
};