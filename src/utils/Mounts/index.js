import utils from "../index.js";

const Mount = (id, template, actions, App) => {
  // Add a new DIV to the DOMs root with ID to match Component name
  utils.AddToRoot(id)
    .then(El => {
      // Apply the corresponding template to the Component
      // Pass App argument to template and actions to manage App state
      new Promise(resolve => resolve(El.innerHTML = template(App)))
        .then(() => actions(App));
    });
}

export {
  Mount
};
