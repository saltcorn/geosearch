const Workflow = require("@saltcorn/data/models/workflow");
const Form = require("@saltcorn/data/models/form");
const {
  div,
  button,
  script,
  span,
  p,
  h5,
  strong,
} = require("@saltcorn/markup/tags");
const { isNode } = require("@saltcorn/data/utils");

const get_state_fields = async (table_id) => [];

const configuration_workflow = () =>
  new Workflow({
    steps: [
      {
        name: "Event Configuration",
        blurb: "Attributes of the events to be displayed on the calendar.",
        form: async (context) =>
          new Form({
            fields: [
              {
                name: "distance_filter",
                label: "Distance Filter",
                sublabel: "Metres until location update",
                type: "Integer",
                required: true,
                default: 5,
              },
            ],
          }),
      },
    ],
  });

const run = async (
  table_id,
  viewname,
  { distance_filter },
  state,
  extraArgs
) => {
  if (isNode()) return div("Only available in mobile app");
  const watcherId = saltcorn.mobileApp.plugins.geosearch.getWatcherId();
  return div(
    { class: "card mt-4" },
    span(
      { class: "card-header" },
      div(
        { class: "card-title" },
        h5({ class: "m-0 fw-bold text-primary d-inline" }, "Background Locator")
      )
    ),
    div(
      { class: "card-body" },

      div(
        { class: "container" },
        div(
          { class: "d-flex align-items-center gap-2" },
          button(
            {
              class: "btn btn-success",
              id: "start-loc",
              onclick: "startLocationWatch()",
              disabled: watcherId ? true : false,
            },
            "start"
          ),
          button(
            {
              class: "btn btn-danger",
              id: "stop-loc",
              onclick: "stopLocationWatch()",
              disabled: watcherId ? false : true,
            },
            "stop"
          ),
          span(
            { class: "badge bg-secondary p-2", id: "locator-status-badge" },
            watcherId ? "Tracking" : "Not tracking"
          )
        ),
        div(
          { id: "last-tracked-box", class: "mt-1 container p-3 d-none" },
          h5("Last Tracked Location"),
          div(
            { class: "d-flex justify-content-between" },
            p(
              { class: "mb-0" },
              strong("Latitude: "),
              span({ id: "lati-id" }, "not set")
            ),
            p(
              { class: "mb-0" },
              strong("Longitude: "),
              span({ id: "longi-id" }, "not set")
            )
          )
        ),
        script(`
function startLocationWatch() {
  const { initLocationWatch } = parent.saltcorn.mobileApp.plugins.geosearch;
  initLocationWatch(${distance_filter});
  document.getElementById("locator-status-badge").innerText = "Active";
  document.getElementById("start-loc").disabled = true;
  document.getElementById("stop-loc").disabled = false;
}

function stopLocationWatch() {
  const { stopLocationWatch } = parent.saltcorn.mobileApp.plugins.geosearch;
  stopLocationWatch();
  document.getElementById("locator-status-badge").innerText = "Inactive";
  document.getElementById("start-loc").disabled = false;
  document.getElementById("stop-loc").disabled = true;
}
`)
      )
    )
  );
};

module.exports = {
  name: "Background Locator",
  display_state_form: false,
  tableless: true,
  get_state_fields,
  configuration_workflow,
  run,
};
