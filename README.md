# WebpackTemplate
Pure stateful JavaScript application template

### Clone This Repo
With ssh keys configured for GitHub.

```bash 
$ git clone git@github.com:paddonm/WebpackTemplate.git 
```

Otherwise:
```bash
$ git clone https://github.com/paddonm/WebpackTemplate.git
```

### Move into the project directory
```bash
$ cd WebpackTemplate
```

### Install the Node Modules for the Express App Using Yarn
```bash
$ cd <project_base_directory>
$ yarn install
```

### Create App components
Components are created in the folder src > components using the following structure:
- components
  - your_component
    - index.js
    - actions
      - index.js
    - template
      - index.js

Functions within the actions file will execute AFTER the DOM template is mounted (similar to React's ComponentDidMount).

Below are sample templates for each of the above files:

your_component > index.js
```bash
import utils    from "../../utils";
import template from "./template";
import actions  from "./actions";

export default (App) => utils.Mount('your_component', template, actions, App);
```

your_component > actions > index.js
```bash
export default (App) => {
  // Execute any component actions here...
};
```

your_component > template > index.js
```bash
export default (App) => {
  // Build HTML template to render component
  return ``;
};
```

Once the component is created, import to: src > components > index.js.
All components created will be executed on load, to execute components in sequence remove the looping function from within app.js and replace with individual function calls for each component.

### Manage Application state
App state can be managed in the actions and template files for each component using the App argument that is passed to your template and actions functions.

The App argument is an object containing the following:
```bash
{
  state: {},
  setState: updated => new Promise(resolve => resolve(Object.assign(App.state, updated)))
}
```

### Start the Server
The express server runs on port 5000

```bash
$ yarn run start
```

Open a browser to [http://localhost:5000/](http://localhost:5000/)
