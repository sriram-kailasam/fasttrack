import io from "socket.io";
import crypto from "crypto";
import { Router, Request, Response } from "express";
import { Redis } from "ioredis";
import { Db } from "mongodb";

export class AdmitRequestController {
  private router = Router();
  constructor(
    private socketServer: io.Server,
    private redis: Redis,
    private db: Db
  ) {}

  findAllRequests = async (req: Request, res: Response) => {
    const requestIds: string[] = await this.redis.smembers(
      "pending-admit-requests"
    );

    const requests = await this.db
      .collection("admit-requests")
      .find({ id: { $in: requestIds } }, { projection: { _id: 0 } })
      .toArray();

    res.json({ success: true, requests });
  };

  requestAdmission = async (req: Request, res: Response) => {
    const payload = {
      id: crypto.randomBytes(20).toString("hex"),
      location: req.body.location,
      age: req.body.age,
      eta: Math.random() * 30,
      gender: req.body.gender,
      tag: req.body.tag
    };

    this.socketServer.sockets.emit("admit-request", payload);
    this.redis.sadd("pending-admit-requests", payload.id);
    await this.db.collection("admit-requests").insertOne(payload);

    res.json({ success: true });
  };

  register() {
    this.router.get("/", this.findAllRequests);
    this.router.post("/", this.requestAdmission);

    return this.router;
  }
}
