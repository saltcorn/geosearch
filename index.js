const searchbar = require("./searchbar_view");
const backgroundLocator = require("./background_locator");
const { features } = require("@saltcorn/data/db/state");

module.exports = {
  sc_plugin_api_version: 1,
  viewtemplates: [searchbar, backgroundLocator],
  plugin_name: "geosearch",
  fieldviews: require("./fieldviews"),
  headers: [
    {
      script: `/plugins/public/geosearch@${
        require("./package.json").version
      }/geolocation.js`,
    },
  ],
  ready_for_mobile: true,
  capacitor_plugins: [
    {
      name: "@capacitor-community/background-geolocation",
      version: features.capacitor_version === 7 ? "1.2.26" : "1.2.21",
      androidPermissions: ["ACCESS_BACKGROUND_LOCATION"],
      androidFeatures: ["android.hardware.location.gps"],
    },
    {
      name: "@capacitor/geolocation",
      version: features.capacitor_version === 7 ?  "7.1.6" : "6.0.2",
      androidPermissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      androidFeatures: ["android.hardware.location.gps"],
    },
  ],
  eventTypes: { ReceiveLocation: { hasChannel: false } },
};
