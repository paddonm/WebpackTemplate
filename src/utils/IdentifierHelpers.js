
export const createOnSchedElement = element => {
  var elDiv = document.createElement('DIV');
  elDiv.id = element;
  
  return new Promise((resolve, reject) => {
    var elRoot = document.getElementById('root');
    if (elRoot) {
      var existingElement = elRoot.querySelector(`#${element}`);
      
      if (!existingElement)
        resolve(elRoot.appendChild(elDiv));
      else
        resolve(existingElement)
    }
  })
}
