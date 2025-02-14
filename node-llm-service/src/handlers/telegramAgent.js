const axios = require('axios');

async function telegramAgentHandler(node) {
  const { botToken, messageConfig } = node.data;

  if (!botToken) {
    return { error: "No Telegram Bot Token provided" };
  }

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
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: config.chatId,
        text: config.message
      }
    );
    return { success: true, message: response.data };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { error: error.message };
  }
}

async function handleReceiveMessage(botToken) {
    try {
        const response = await axios.get(
            `https://api.telegram.org/bot${botToken}/getUpdates`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        return { success: true, message: response.data };
    } catch (error) {
        console.error("Error receiving Telegram message:", error);
        if (error.response) {
            console.error("Telegram API Response:", error.response.data);
        }
        return { error: error.message };
    }
}

module.exports = telegramAgentHandler; 