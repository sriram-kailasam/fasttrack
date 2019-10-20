import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { Db } from "mongodb";
import crypto from "crypto";

export function configSocket(socketServer: Server, redis: Redis, db: Db) {
  socketServer.on("connect", async function(socket: Socket) {
    console.log("User connected");

    const hospital = await db.collection("hospitals").findOne({});
    const hospitalId = hospital.id;

    socket.emit("message", hospitalId);
    this.redis.sadd("hospitals", hospitalId);

    socket.on("admit-request-accept", async data => {
      if (
        await redis.sismember("pending-admit-requests", data.admitRequestId)
      ) {
        redis.srem("pending-admit-requests", data.admitRequestId);

        const hospital = await db
          .collection("hospitals")
          .findOne({ id: hospitalId });

        socketServer.sockets.emit("admit-request-accept", {
          location: hospital.location,
          hospitalId,
          admitRequestId: data.admitRequestId
        });

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
