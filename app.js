const express = require("express");
const app = express();
const server = require("http").createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/assets", express.static("assets"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/subtitle.html");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/subtitle.html");
});

app.get("/admin", (req, res) => {
    res.sendFile(__dirname + "/admin.html");
});

io.on("connection", (socket) => {
    console.log("连接加入");
    socket.on("set", (msg) => {
        console.log(msg);
        io.emit("set", msg);
    });
    socket.on("disconnect", () => {
        console.log("连接断开");
    });
});

const port = 3500;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
