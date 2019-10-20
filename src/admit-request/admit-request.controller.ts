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

  register() {
    this.router.post("/", this.findNearbyHospitals);

    return this.router;
  }
}
