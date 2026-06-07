function registerSocketHandlers({ io }) {
  io.on("connection", (socket) => {
    // Mobile app: socket.emit("register", { userId })
    socket.on("register", ({ userId } = {}) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });
  });
}

module.exports = { registerSocketHandlers };

