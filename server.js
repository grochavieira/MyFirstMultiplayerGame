import express from "express";
import http from "http";
import createGame from "./public/game.js";
import socketio from "socket.io";

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

// Serve para deixar essa pasta publica
app.use(express.static("public"));

const game = createGame();
game.start();

game.subscribe(command => {
  console.log(`=> Emitting ${command.type}`);
  sockets.emit(command.type, command);
});

console.log(game.state);

sockets.on("connection", socket => {
  const playerId = socket.id;
  console.log(`=> Player connected on Server with id: ${playerId}`);

  game.addPlayer({ playerId: playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId: playerId });
    console.log(`=> Player disconnected: ${playerId}`);
  });

  socket.on("move-player", command => {
    command.playerId = playerId;
    command.type = "move-player";

    game.movePlayer(command);
  });
});

server.listen(3000, () => {
  console.log("=> Server listening to port 3000");
});