const {
  input,
  div,
  text,
  script,
  domReady,
  style,
} = require("@saltcorn/markup/tags");
const { renderForm } = require("@saltcorn/markup");

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
            fields: [],
          });
        },
      },
    ],
  });

const get_state_fields = async (table_id) => [];

const run = async (table_id, viewname, {}, state, extraArgs) => {
  const form = new Form({
    action: `/view/${viewname}`,
    methodGET: true,
    noSubmitButton: true,
    fields: [{ name: "_locq", label: "Location", input_type: "search" }],
  });
  if (state._locq) form.values._locq = state._locq;

  return renderForm(form, extraArgs.req.csrfToken());
};

module.exports = {
  name: "Geosearch input",
  display_state_form: false,
  get_state_fields,
  configuration_workflow,
  run,
};
