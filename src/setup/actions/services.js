import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'

export const CreateService = (element, response) => {
    if (response.error) {
        console.log("Rest error response code=" + response.code);
        console.log(response.data);
        var errorEvent = new CustomEvent("serviceSetupError", { detail: response });
        var elServiceSetup = document.getElementById(element.id);
        elServiceSetup.dispatchEvent(errorEvent);    
        return response;
    }
    // check if we need to upload an image for this resource
    const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
    if (elSystemFileUploadBtn?.value) {

        var image = document.getElementById("onsched-image-preview");
        const base64String = OnSchedWizardHelpers.Base64Encoded(image); 

        var postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
        console.log(postData);
        const uploadImageUrl = element.onsched.setupApiBaseUrl + "/services/"+ response.id + "/uploadimage";
        element.onsched.accessToken.then(x =>
            OnSchedRest.Post(x, uploadImageUrl, postData, function (response) {
                if (response.error) {
                    console.log("PostServiceImgae Rest error response code=" + response.code);
                    return;
                }
                console.log("PostServiceImgage SUCCESS");
                console.log(response);
            })
        );        
    }

    console.log("OnSchedResponse.PostService");
    console.log(response);
    var elServiceSetup = document.getElementById(element.id);
    var confirmationEvent = new CustomEvent("serviceSetupComplete", { detail: response });
    elServiceSetup.dispatchEvent(confirmationEvent);    
}

export const ModifyService = (element, response) => {
    if (response.error) {
        console.log("Rest error response code=" + response.code);
        console.log(response.data);
        return;
    }
    // check if we need to upload an image for this resource
    const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
    if (elSystemFileUploadBtn?.value) {
        var image = document.getElementById("onsched-image-preview");
        const base64String = OnSchedWizardHelpers.Base64Encoded(image); 
        var postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
        console.log(postData);
        const uploadImageUrl = element.onsched.setupApiBaseUrl + "/services/"+ response.id + "/uploadimage";
        element.onsched.accessToken.then(x =>
            OnSchedRest.Post(x, uploadImageUrl, postData, function (response) {
                if (response.error) {
                    console.log("PostServiceImgae Rest error response code=" + response.code);
                    return;
                }
            })
        );                 
    }
    
    console.log("OnSchedResponse.PutService");
    console.log(response);        
    var elResourceSetup = document.getElementById(element.id);
    var confirmationEvent = new CustomEvent("serviceetupComplete", { detail: response });
    elResourceSetup.dispatchEvent(confirmationEvent); 
    elResourceSetup.innerHTML = "";   
}
