import io from "socket.io";
import { Router, Request, Response } from "express";
import { Redis } from "ioredis";
import { HospitalService } from "../hospitals/hospitals.service";

export class AdmitRequestController {
  private router = Router();
  constructor(private socketServer: io.Server, private redis: Redis) {}

  findNearbyHospitals = async (req: Request, res: Response) => {
    if (req.body.admitRequestId == null || req.body.admitRequestId == "") {
      return res
        .status(400)
        .json({ success: false, error: "Admit request ID cannot be empty" });
    }

    this.socketServer.sockets.emit(
      "admit-request",
      "New admit request: " + req.body.admitRequestId
    );
    this.redis.sadd("pending-admit-requests", req.body.admitRequestId);

    res.json({ success: true });
  };

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

  register() {
    this.router.post("/", this.findNearbyHospitals);
    this.router.get("/", this.findAllRequests);

    return this.router;
  }
}
