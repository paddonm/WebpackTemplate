export const CreateLocation = (element, response) => {
  if (response.error) {
      console.log("Rest error response code=" + response.code);
      return;
  }
  console.log("OnSchedResponse.PostLocation");
  console.log(response);
  var elLocationSetup = document.getElementById(element.id);
  var confirmationEvent = new CustomEvent("locationSetupComplete", { detail: response });
  elLocationSetup.dispatchEvent(confirmationEvent);    
  elLocationSetup.innerHTML = "";    
}

export const ModifyLocation = (element, response) => {
  if (response.error) {
      console.log("Rest error response code=" + response.code);
      console.log(response.data);
      return;
  }
  var elLocationSetup = document.getElementById(element.id);
  var confirmationEvent = new CustomEvent("locationSetupComplete", { detail: response });
  elLocationSetup.dispatchEvent(confirmationEvent);
  elLocationSetup.innerHTML = "";    
}
