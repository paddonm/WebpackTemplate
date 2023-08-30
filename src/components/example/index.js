import utils    from "../../utils/index.js";
import template from "./template/index.js";
import actions  from "./actions/index.js";


export default (App) => utils.Mount('example', template, actions, App);
