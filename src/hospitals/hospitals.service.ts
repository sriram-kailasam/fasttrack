import axios from "axios";

export class HospitalService {
  async findNearbyHospitals(coords: {
    lat: number;
    lng: number;
  }): Promise<any[]> {
    const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const radius = 10000;
    try {
      const resp = await axios.get(url, {
        params: {
          location: `${coords.lat},${coords.lng}`,
          type: "hospital",
          radius: radius,
          key: process.env.MAPS_API_KEY
        }
      });

      console.log("Status:", resp.status);
      console.log(resp.data);

      return resp.data.results.map(place => {
        return {
          name: place.name,
          location: place.geometry.location
        };
      });
    } catch (err) {
      console.error(err);
    }
  }
}
