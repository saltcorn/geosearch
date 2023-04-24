const {
  input,
  div,
  a,
  text,
  script,
  text_attr,
  domReady,
  style,
} = require("@saltcorn/markup/tags");

const user_locator = (longorlat) => ({
  type: "Float",
  isEdit: true,
  run: (nm, v, attrs, cls, required, field) => {
    return (
      input({
        type: "hidden",
        name: text_attr(nm),
        "data-fieldname": text_attr(field.name),
        id: `input${text_attr(nm)}`,
        value: v,
      }) +
      script(
        domReady(
          `activate_user_location_input('${nm}', '${longorlat}', ${!!v})`
        )
      )
    );
  },
});

module.exports = {
  user_longitude: user_locator("long"),
  user_latitude: user_locator("lat"),
};
