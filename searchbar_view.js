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
                name: "latitude_field",
                label: "Latitude field",
                type: "String",
                sublabel:
                  "The table need a fields of type 'Float' for latitude.",
                required: true,
                attributes: {
                  options: fields
                    .filter((f) => f.type.name === "Float")
                    .map((f) => f.name)
                    .join(),
                },
              },
              {
                name: "longtitude_field",
                label: "Longtitude field",
                type: "String",
                sublabel:
                  "The table need a fields of type 'Float' for longtitude.",
                required: true,
                attributes: {
                  options: fields
                    .filter((f) => f.type.name === "Float")
                    .map((f) => f.name)
                    .join(),
                },
              },
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

const usemylocscript = ({ latitude_field, longtitude_field }) => `
function use_my_location() {
  navigator.geolocation.getCurrentPosition(function(position) {
    set_state_fields({
      _near_lat_${latitude_field}:position.coords.latitude,
      _near_long_${longtitude_field}:position.coords.longitude,
      _locq: {unset: true}
    })    
  })
}
function use_this_location(lat,long, nm) {
  set_state_fields({
    _near_lat_${latitude_field}:lat,
    _near_long_${longtitude_field}:long,
    _locq: nm
  })    
}
function search_location(q) {
  set_state_fields({
    _near_lat_${latitude_field}:{unset: true},
    _near_long_${longtitude_field}:{unset: true},
    _locq: q
  })    
}
function call_search_location() {
  const inputObj = $("input.search-bar");
  const q = inputObj.val()
    ? inputObj.val()
    : inputObj[0].placeholder?.startsWith("[")
    ? inputObj[0].placeholder.replaceAll("\u00B0", "") // remove degree symbol
    : "";
  search_location(q);
}
`;

const run = async (
  table_id,
  viewname,
  { mylocation, latitude_field, longtitude_field },
  state,
  extraArgs,
  queryObj
) => {
  const round = (x) => Math.round(x * 100) / 100;
  const latStateField = `_near_lat_${latitude_field}`;
  const longStateField = `_near_long_${longtitude_field}`;
  const placeHolder =
    state[latStateField] && state[longStateField]
      ? `[${round(state[latStateField])}&deg;, ${round(
          state[longStateField]
        )}&deg;]`
      : "Enter Location...";
  let choices = "";
  if (state._locq && !(state[latStateField] && state[longStateField])) {
    const response = queryObj?.geocoder_query
      ? await queryObj.geocoder_query(state._locq)
      : await geocoder_query_impl(state._locq);
    choices = div(
      "Possible locations:",
      response.map((r) =>
        div(
          a(
            {
              href: `javascript:use_this_location(${r.lat},${r.lon}, '${r.display_name}')`,
            },
            "&rarr;",
            r.display_name
          )
        )
      )
    );
  }
  return (
    search_bar("_locq", state._locq, {
      placeHolder,
      onClick: "call_search_location()",
    }) +
    choices +
    (mylocation
      ? a({ href: `javascript:use_my_location()` }, "Use my current location") +
        script(usemylocscript({ latitude_field, longtitude_field }))
      : "")
  );
};
const geocoder_query_impl = async (locq) => {
  const response = await geocoder.search({ q: locq });
  db.sql_log({ response });
  return response;
};
module.exports = {
  name: "Geosearch input",
  display_state_form: false,
  get_state_fields,
  configuration_workflow,
  run,
  queries: () => ({
    async geocoder_query(locq) {
      return await geocoder_query_impl(locq);
    },
  }),
};
