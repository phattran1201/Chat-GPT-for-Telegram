// Config các biến môi trường

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const ChatGPTService = require("./services/chatgpt.service");
const DbService = require("./services/db.service");
const telegramToken = process.env.TELEGRAM_KEY;

DbService.connect().then(() => {
  // Khởi tạo con Bot từ Token với chế độ Polling
  const bot = new TelegramBot(telegramToken, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id; // ID của cuộc trò chuyện hiện tại
    const chatMsg = msg.text; // Nội dung của tin nhắn đã nhận
    // Nhập lại nội dung tin nhắn
    bot.sendMessage(chatId, chatMsg);

    const authorId = msg.from.id; // Lấy id của người gửi
    // Đầu tiên sẽ lấy thông tin user ra
    const user = await DbService.getUserByTelegramId(authorId);
    // Trả lời tin nhắn dựa trên các tin nhắn cũ
    ChatGPTService.generateCompletion(chatMsg, user)
      .then((responseMsg) => {
        bot.sendMessage(chatId, responseMsg);
      })
      .catch((err) => {
        bot.sendMessage(
          chatId,
          `[${err?.response?.status} ${err?.response?.statusText}]  ${err?.response?.data?.error?.message}`
        );
        console.log("🚀 phat.log ~ file: app.js:18 ~ err:", err?.response);
      });
  });
});
