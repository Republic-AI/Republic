const axios = require('axios');

async function discordAgentHandler(node) {
    const { botToken, messageConfig } = node.data;

    if (!botToken) {
        return { error: "No Discord Bot Token provided" };
    }

    //  Handle message sending.  You'll need to adapt this based on your needs.
    if (node.data.action === 'sendMessage') {
        return handleSendMessage(botToken, messageConfig);
    }
    
    if (node.data.action === "receiveMessage") {
        return handleReceiveMessage(botToken);
    }

    return { error: "Invalid action" };
}

async function handleSendMessage(botToken, config) {
    try {
        const response = await axios.post(
            `https://discord.com/api/v10/channels/${config.channelId}/messages`,  // Correct API endpoint
            { content: config.message },
            {
                headers: {
                    'Authorization': `Bot ${botToken}`, //  Use 'Bot' prefix
                    'Content-Type': 'application/json',
                }
            }
        );

        return { success: true, message: response.data };
    } catch (error) {
        console.error('Error sending Discord message:', error);
        if (error.response) {
          console.error("Discord API Response:", error.response.data); // Log detailed error
        }
        return { error: error.message };
    }
}

async function handleReceiveMessage(botToken) {
    try {
        const response = await axios.get(
            `https://discord.com/api/v10/users/@me/channels`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        
        return { success: true, message: response.data };
    } catch (error) {
        console.error("Error receiving Discord message:", error);
        if (error.response) {
            console.error("Discord API Response:", error.response.data);
        }
        return { error: error.message };
    }
}

module.exports = discordAgentHandler; 