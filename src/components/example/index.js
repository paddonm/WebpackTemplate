import utils    from "../../utils";
import template from "./template";
import actions  from "./actions";


export default (App) => utils.Mount('example', template, actions, App);
