module.exports = {
    name: "help",
    description: "Muestra la ayuda para un comando específico.",
    execute(api, event, args, commands) {
        if (args.length === 0) {
            api.sendMessage("Usa `help <comando>` para ver la descripción de un comando.", event.threadID);
            return;
        }

        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) {
            api.sendMessage(`El comando '${commandName}' no existe.`, event.threadID);
            return;
        }

        api.sendMessage(`*${command.name}*: ${command.description}`, event.threadID);
    }
};