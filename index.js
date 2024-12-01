const searchbar = require("./searchbar_view");

module.exports = {
  sc_plugin_api_version: 1,
  viewtemplates: [searchbar],
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
};
