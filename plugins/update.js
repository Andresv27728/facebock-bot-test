const { exec } = require('child_process');

module.exports = {
    name: "update",
    description: "Actualiza el bot desde el repositorio de Git (solo para administradores).",
    execute(api, event) {
        const adminID = process.env.FB_ADMIN_ID;

        // Verificar si el que envía el mensaje es el administrador
        if (!adminID || event.senderID !== adminID) {
            api.sendMessage("❌ No tienes permiso para usar este comando.", event.threadID);
            return;
        }

        api.sendMessage("🔄 Actualizando el bot desde el repositorio...", event.threadID);

        // Ejecutar 'git pull' en el directorio del bot
        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar git pull: ${error.message}`);
                api.sendMessage(`Error al actualizar:\n${error.message}`, event.threadID);
                return;
            }

            if (stderr && !stderr.includes('Already up to date.')) {
                 console.warn(`Git pull stderr: ${stderr}`);
            }

            let responseMessage = "✅ **Actualización completada**\n\n";
            responseMessage += `Salida de Git:\n\`\`\`\n${stdout || 'No hay salida.'}\n\`\`\``;

            if (stdout.includes('package.json')) {
                responseMessage += "\n\nSe detectaron cambios en `package.json`. Ejecutando `npm install`...";
                 exec('npm install', (npmError, npmStdout, npmStderr) => {
                    if (npmError) {
                        console.error(`Error al ejecutar npm install: ${npmError.message}`);
                        responseMessage += `\n\nError al ejecutar \`npm install\`:\n${npmError.message}`;
                    } else {
                        responseMessage += `\n\n✅ \`npm install\` completado.\nSalida:\n\`\`\`\n${npmStdout}\n\`\`\``;
                    }
                    responseMessage += "\n\nReinicia el bot para aplicar todos los cambios.";
                    api.sendMessage(responseMessage, event.threadID);
                });
            } else {
                 responseMessage += "\n\nReinicia el bot para aplicar los cambios.";
                 api.sendMessage(responseMessage, event.threadID);
            }
        });
    }
};