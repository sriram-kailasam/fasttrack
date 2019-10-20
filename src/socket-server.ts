import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";

export function configSocket(socketServer: Server, redis: Redis) {
  socketServer.on("connect", function(socket: Socket) {
    console.log("User connected");

    socket.on("admit-request-accept", async data => {
      if (
        await redis.sismember("pending-admit-requests", data.admitRequestId)
      ) {
        redis.srem("pending-admit-requests", data.admitRequestId);
        console.log("Accepted");
      } else {
        console.log("Already accepted");
      }
    });
  });
}
