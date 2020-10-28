const {
  input,
  div,
  a,
  text,
  script,
  domReady,
  style,
} = require("@saltcorn/markup/tags");
const { renderForm } = require("@saltcorn/markup");
const { search_bar } = require("@saltcorn/markup/helpers");

const View = require("@saltcorn/data/models/view");
const Workflow = require("@saltcorn/data/models/workflow");
const Table = require("@saltcorn/data/models/table");
const db = require("@saltcorn/data/db");
const Form = require("@saltcorn/data/models/form");
const Field = require("@saltcorn/data/models/field");
const { stateFieldsToWhere } = require("@saltcorn/data/plugin-helper");
const Nominatim = require("nominatim-geocoder");
const geocoder = new Nominatim();

const configuration_workflow = () =>
  new Workflow({
    steps: [
      {
        name: "views",
        form: async (context) => {
          const table = await Table.findOne({ id: context.table_id });
          const fields = await table.getFields();

          return new Form({
            fields: [
              {
                name: "mylocation",
                label: "Allow current location",
                type: "Bool",
              },
            ],
          });
        },
      },
    ],
  });

const get_state_fields = async (table_id) => [];

const usemylocscript = `
function use_my_location() {
  navigator.geolocation.getCurrentPosition(function(position) {
    set_state_fields({
      _loclat:position.coords.latitude,
      _loclong:position.coords.longitude,
    })    
  })
}
`;

const run = async (table_id, viewname, { mylocation }, state, extraArgs) => {
  const round = (x) => Math.round(x * 100) / 100;
  const placeHolder =
    state._loclat && state._loclong
      ? `[${round(state._loclat)}&deg;, ${round(state._loclong)}&deg;]`
      : "Enter Location...";
  return (
    search_bar("_locq", state._locq, {
      placeHolder,
      onClick:
        "(function(v){v ? set_state_field('_locq', v):unset_state_field('_locq');})($('.search-bar').val())",
    }) +
    (mylocation
      ? a({ href: "javascript:use_my_location()" }, "Use my current location") +
        script(usemylocscript)
      : "")
  );
};

module.exports = {
  name: "Geosearch input",
  display_state_form: false,
  get_state_fields,
  configuration_workflow,
  run,
};
