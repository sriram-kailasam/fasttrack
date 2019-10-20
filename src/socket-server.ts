import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { Db } from "mongodb";
import crypto from "crypto";

export function configSocket(socketServer: Server, redis: Redis, db: Db) {
  socketServer.on("connect", function(socket: Socket) {
    console.log("User connected");
    const hospitalId = crypto.randomBytes(20).toString("hex");
    socket.emit("message", hospitalId);

    socket.on("admit-request-accept", async data => {
      if (
        await redis.sismember("pending-admit-requests", data.admitRequestId)
      ) {
        redis.srem("pending-admit-requests", data.admitRequestId);
        socketServer.sockets.emit("admit-request-accept", data.admitRequestId);
        db.collection("admit-requests").updateOne(
          { id: data.admitRequestId },
          {
            $set: {
              acceptedBy: data.hospitalId
            }
          }
        );
      } else {
        socket.emit("admit-request-already-accepted", data.admitRequestId);
      }
    });
  });
}
