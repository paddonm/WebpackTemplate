export const addElementToRoot = (elementId, target) => {
  var elRoot = document.getElementById('root');
  
  if (target)
    elRoot = document.getElementById(target);

  var newEl = document.createElement('DIV');
  newEl.id = elementId;

  var existingElement = elRoot.querySelector(`#${elementId}`);

  return new Promise((resolve, reject) => {
    if (!existingElement)
      resolve(elRoot.appendChild(newEl));
    else
      resolve(existingElement);
  })
}

export const removeElementFromRoot = elementId => {
  var elRoot = document.getElementById('root');
  var element = elRoot.querySelector(`#${elementId}`);
  
  if (element)
    return new Promise((resolve, reject) => resolve(element.remove()))
  else
    return new Promise((resolve, reject) => resolve())
}

export const contentHeight = () => {
  // create an Observer instance
  const resizeObserver = new ResizeObserver(entries => {
    var detail = { contentHeight: entries[0].target.clientHeight }
    var heightChangeEvent = new CustomEvent('contentHeight', { detail })
    window.parent.document.dispatchEvent(heightChangeEvent)
  })

  // start observing a DOM node
  resizeObserver.observe(document.body)
}
