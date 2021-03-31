export const ShowProgress = () => {
  // clear out any errors that are currently displayed
  var errorContainer = document.querySelector(".onsched-error-container");
  if (errorContainer != null)
      errorContainer.innerHTML = "";
  var indicators = document.getElementsByClassName("onsched-progress");
  for (var i = 0; i < indicators.length; i++) {
      indicators[i].style.display = "block";
  }
}

export const HideProgress = () => {
  var indicators = document.getElementsByClassName("onsched-progress");
  for (var i = 0; i < indicators.length; i++) {
      indicators[i].style.display = "none";
  }
}
