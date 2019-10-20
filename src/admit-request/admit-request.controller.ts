import io from "socket.io";
import { Router, Request, Response } from "express";
import { Redis } from "ioredis";

export class AdmitRequestController {
  private router = Router();
  constructor(private socketServer: io.Server, private redis: Redis) {}

  findAllRequests = async (req: Request, res: Response) => {
    const requestIds: string[] = await this.redis.smembers(
      "pending-admit-requests"
    );
    const requests = requestIds.map(id => {
      return {
        id: id,
        tag: ["heart", "ortho", "cardio", "ocular", "neuro"][
          Math.floor(Math.random() * 5)
        ],
        gender: Math.random() > 0.5 ? "male" : "female",
        eta: Math.random() * 20,
        lat: -50 + Math.random() * 100,
        lng: -50 + Math.random() * 100,
        age: 15 + Math.random() * 50
      };
    });

    res.json({ success: true, requests });
  };

  requestAdmission = async (req: Request, res: Response) => {
    const payload = {
      location: req.body.location,
      age: req.body.age,
      eta: 0,
      gender: req.body.gender,
      tag: req.body.tag
    };
    this.socketServer.sockets.emit("admit-request", payload);

    res.json({ success: true });
  };

  register() {
    this.router.get("/", this.findAllRequests);
    this.router.post("/", this.requestAdmission);

    return this.router;
  }
}
