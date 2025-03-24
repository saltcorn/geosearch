import { Geolocation } from "@capacitor/geolocation";

export async function getLocation(successCb, errorCb) {
  try {
    const coordinates = await Geolocation.getCurrentPosition();
    if (successCb) successCb(coordinates);
    return coordinates;
  } catch (error) {
    if (errorCb) errorCb(error);
    return null;
  }
}
