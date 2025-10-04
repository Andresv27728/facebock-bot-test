module.exports = {
    name: "userinfo",
    description: "Muestra información sobre tu usuario.",
    execute(api, event) {
        api.getUserInfo(event.senderID, (err, ret) => {
            if (err) return console.error(err);
            const user = ret[event.senderID];
            const message = `*Información de Usuario*\n\n` +
                            `*Nombre*: ${user.name}\n` +
                            `*ID*: ${event.senderID}\n` +
                            `*Nombre de Pila*: ${user.firstName}\n` +
                            `*Perfil*: ${user.profileUrl}`;
            api.sendMessage(message, event.threadID);
        });
    }
};