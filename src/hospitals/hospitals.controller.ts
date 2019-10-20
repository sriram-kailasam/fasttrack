import { HospitalService } from "./hospitals.service";
import { Request, Response, Router } from "express";

export class HospitalsController {
  private router = Router();
  constructor(private hospitalService: HospitalService) {}

  findNearbyHospitals = async (req: Request, res: Response) => {
    // if (req.body.location == null || req.body.location == "") {
    //   return res
    //     .status(400)
    //     .json({ success: false, error: "Location cannot be empty" });
    // }

    const location = {
      lat: req.query.lat,
      lng: req.query.lng
    };

    console.log(location);
    const hospitals = await this.hospitalService.findNearbyHospitals(location);

    res.json({
      success: true,
      hospitals
    });
  };

  register() {
    this.router.get("/nearbysearch", this.findNearbyHospitals);
    return this.router;
  }
}
