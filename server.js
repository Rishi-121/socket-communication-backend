const http = require("http");
const { PORT } = require("./config/env");
const app = require("./app");

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: '*',
    }
});

var users = [];

io.on("connection", (socket) => {

    socket.on("loggedin_user", (userId) => {

        let userObj = { userId, socketId: socket.id };

        users.push(userObj);

    });

    socket.on("send_notifications", (userId) => {
        let user = users.find((e) => e.userId === userId);
    
        let msg = "A test notification send by admin";
         
        if (user && user !== undefined) {
            socket.to(user.socketId).emit("notification_received_by_admin", msg);
        }
    });

    socket.on('disconnect', () => {
        users = users.filter((e) => e.socketId !== socket.id);
    });
});

server.listen(
    PORT,
    console.log(`Server running in "${process.env.NODE_ENV}" mode on port ${PORT}`)
);