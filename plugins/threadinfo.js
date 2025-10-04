module.exports = {
    name: "threadinfo",
    description: "Muestra información sobre el chat actual.",
    execute(api, event) {
        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return console.error(err);
            const message = `*Información del Chat*\n\n` +
                            `*Nombre*: ${info.name || 'No tiene'}\n` +
                            `*ID*: ${event.threadID}\n` +
                            `*Participantes*: ${info.participantIDs.length}`;
            api.sendMessage(message, event.threadID);
        });
    }
};