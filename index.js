const searchbar = require("./searchbar_view");
const results = require("./results_view");

module.exports = {
  sc_plugin_api_version: 1,
  viewtemplates: [searchbar, results],
};
