
export const createOnSchedElement = (element, target) => {
  var elDiv = document.createElement('DIV');
  elDiv.id = element;
  
  return new Promise((resolve, reject) => {
    var elRoot = document.getElementById('root');

    if (target)
      elRoot = document.getElementById(target);

    if (elRoot) {
      var existingElement = elRoot.querySelector(`#${element}`);
      
      if (!existingElement)
        resolve(elRoot.appendChild(elDiv));
      else
        resolve(existingElement)
    }
  })
}
