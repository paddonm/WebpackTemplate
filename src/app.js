import components from "./components";


const App = () => {
  // Executing App components
    // at once: leave existing code
    // in sequence: comment lines 8,9 and 
      // execute each component individually
      
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
