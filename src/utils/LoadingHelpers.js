export const loading = action => {
  var elRoot = document.getElementById('root');

  var loadingScreen = document.createElement('DIV');
  loadingScreen.innerHTML = '<div class="loader"></div>'
  loadingScreen.id = 'loading';

  var existingLoader = elRoot.querySelector(`#${'loading'}`);

  return new Promise((resolve, reject) => {
    if (action) {
      if (!existingLoader)
        resolve(elRoot.appendChild(loadingScreen));
      else
        resolve(existingLoader);
    }
    else {
      if (!existingLoader)
        resolve();
      else
        resolve(existingLoader.remove());
    }
  })
}
