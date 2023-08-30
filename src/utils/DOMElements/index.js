// DOM Utilities
  // Utilities that affect the browsers DOM

// Add new DIV element to app root
  // Accepts 1 argument:
  // - ID
const AddToRoot = (id) => new Promise((resolve) => {
  const existingEl = document.getElementById(id);

  if (existingEl) {
    resolve(existingEl);
  }
  else {
    const root = document.getElementById('root');
  
    const newEl = document.createElement('DIV');
    newEl.id = id;
  
    root.appendChild(newEl);
  
    resolve(newEl);
  }
});


export {
  AddToRoot,
};
