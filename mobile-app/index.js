import { errorAlert } from "../../helpers/common";
import { Geolocation } from "@capacitor/geolocation";
import { registerPlugin } from "@capacitor/core";
const BackgroundGeolocation = registerPlugin("BackgroundGeolocation");

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

export async function initLocationWatch(distanceFilter) {
  console.log("Starting location watch");
  const watcherId = await BackgroundGeolocation.addWatcher(
    {
      requestPermissions: true,
      stale: false,
      backgroundMessage: "Getting location...",
      backgroundTitle: "Location Access",
      distanceFilter: distanceFilter,
    },
    (location, error) => {
      if (error) errorAlert(error);
      else {
        const user = saltcorn.data.state.getState().mobileConfig.user || {};
        saltcorn.data.models.Trigger.emitEvent(
          "ReceiveLocation",
          null,
          user,
          location
        );
        setLastTrackedLocation(location);
      }
    }
  );
  setWatcherId(watcherId);
}

export function stopLocationWatch() {
  console.log("Stopping location watch");
  const watcherId = getWatcherId();
  if (!watcherId) {
    console.log("No watcher to stop");
  } else {
    BackgroundGeolocation.removeWatcher({
      id: watcherId,
    });
    setWatcherId(null);
  }
}

export function getWatcherId() {
  return saltcorn.data.state.getState().mobileConfig.locationWatcherId;
}

export function setWatcherId(watcherId) {
  saltcorn.data.state.getState().mobileConfig.locationWatcherId = watcherId;
}

function setLastTrackedLocation(location) {
  const iframe = document.getElementById("content-iframe");
  iframe.contentWindow.document.getElementById("lati-id").innerText =
    location.latitude;
  iframe.contentWindow.document.getElementById("longi-id").innerText =
    location.longitude;
  iframe.contentWindow.document
    .getElementById("last-tracked-box")
    .classList.remove("d-none");
}
