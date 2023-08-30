import components from "./components/index.js";


const App = () => {
  // Executing App components
    // At once: leave existing code
    // In sequence: remove the looping function below and execute each component individually
      
  Object.values(components)
    .forEach(component => component(App));
};

// Create Application state
App.state = {};

// Build setState function to update Application state
const setState = newState => new Promise(resolve => resolve(Object.assign(App.state, newState)));

// Add setState function to App
App.setState = setState;

export default App;
