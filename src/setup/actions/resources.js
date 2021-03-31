import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'

export const CreateResource = (element, response) => {
  if (response.error) {
      console.log("Rest error response code=" + response.code);
      console.log(response.data);
      return;
  }
  // check if we need to upload an image for this resource
  const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
  if (elSystemFileUploadBtn.value) {

      var image = document.getElementById("onsched-image-preview");
      const base64String = OnSchedWizardHelpers.Base64Encoded(image); 

      var postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
      console.log(postData);
      const uploadImageUrl = element.onsched.setupApiBaseUrl + "/resources/"+ response.id + "/uploadimage";
      element.onsched.accessToken.then(x =>
          OnSchedRest.Post(x, uploadImageUrl, postData, function (response) {
              if (response.error) {
                  console.log("PostResourceImgae Rest error response code=" + response.code);
                  return;
              }
              console.log("PostResourceImgage SUCCESS");
              console.log(response);
          })
      );        
  }

  console.log("OnSchedResponse.PostResource");
  console.log(response);
  var elResourceSetup = document.getElementById(element.id);
  var confirmationEvent = new CustomEvent("resourceSetupComplete", { detail: response });
  elResourceSetup.dispatchEvent(confirmationEvent);    
}

export const ModifyResource = (element, response) => {
  if (response.error) {
      console.log("Rest error response code=" + response.code);
      console.log(response.data);
      return;
  }
  // check if we need to upload an image for this resource
  const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");

  var base64String;
  var postData = {};

  if (elSystemFileUploadBtn) {
      if (elSystemFileUploadBtn.value) {
          var image = document.getElementById("onsched-image-preview");
          base64String = OnSchedWizardHelpers.Base64Encoded(image); 
          postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
      }
  }
  else {
      postData = element.params.data.image;
  }

  if (postData.imageFileName && postData.imageFileData) {
      const uploadImageUrl = element.onsched.setupApiBaseUrl + "/resources/"+ response.id + "/uploadimage";
      element.onsched.accessToken.then(x =>
          OnSchedRest.Post(x, uploadImageUrl, postData, function (response) {
              if (response.error) {
                  console.log("PostResourceImgae Rest error response code=" + response.code);
                  return;
              }
          })
      );                 
  }
  
  var elResourceSetup = document.getElementById(element.id);
  var confirmationEvent = new CustomEvent("resourceSetupComplete", { detail: response });
  elResourceSetup.dispatchEvent(confirmationEvent); 
  elResourceSetup.innerHTML = "";   
}    
