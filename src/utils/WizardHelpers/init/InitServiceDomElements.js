import { OnSchedRest }          from '../../../OnSchedRest'
import { OnSchedWizardHelpers } from '../OnSchedWizardHelpers'

export const InitServiceDomElements = element => {

  var locationId = element.params.locationId == undefined ? "" : locationId; 
  var urlServiceGroups = element.onsched.apiBaseUrl + "/servicegroups";
  urlServiceGroups = OnSchedHelpers.AddUrlParam(urlServiceGroups, "locationId", locationId);

  var elDurationSelect = document.querySelector(".onsched-wizard.onsched-form input[name=durationSelect]");
  var elMinMaxInterval = document.querySelector(".onsched-form-col.minmaxinterval");
  elDurationSelect.addEventListener("click", function (event) {
      var elMinMaxInterval = document.querySelector(".onsched-form-col.minmaxinterval");
      if (event.target.checked) {
          event.target.dataset.checked = "true";
          elMinMaxInterval.style.opacity = "1";
      }
      else {
          event.target.dataset.checked = "false";
          elMinMaxInterval.style.opacity = "0.5";
      }
  });
  if (elDurationSelect.checked) {
      elDurationSelect.dataset.checked = "true";
      elMinMaxInterval.style.opacity = "1";
  }
  else {
      elDurationSelect.dataset.checked = "false";
      elMinMaxInterval.style.opacity = "0.5";
  }


  // wire up events for the file upload button

  const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
  elSystemFileUploadBtn.addEventListener("change", function(event) {
      const elFileUploadTxt = document.querySelector(".onsched-wizard.onsched-form .onsched-file-upload-txt");
      if (elSystemFileUploadBtn.value) {
          var uploadedFileName = elSystemFileUploadBtn.value.match( /[\/\\]([\w\d\s\.\-\(\)]+)$/ )[0];
          uploadedFileName = uploadedFileName.replace(/^\\|\\$/g, ''); // remove leading backslash
          elFileUploadTxt.innerHTML = uploadedFileName;
          elFileUploadTxt.dataset.uploadedImage = true;
          var image = document.getElementById("onsched-image-preview");
          image.src = URL.createObjectURL(event.target.files[0]);
          const base64String = OnSchedWizardHelpers.Base64Encoded(image); 
          // save the filename so we can POST the uploadimage later
          elSystemFileUploadBtn.dataset.filename = uploadedFileName;
      }
      else {
          elFileUploadTxt.innerHTML = "No file chosen, yet.";
          elFileUploadTxt.dataset.uploadedImage = false;
      }
  });

  const elFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form .onsched-file-upload-btn");
  elFileUploadBtn.addEventListener("click", function(event) {
      elSystemFileUploadBtn.click();
  });


  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, urlServiceGroups, function (response) {
          if (response.error) {
              console.log("Rest error response code=" + response.code);
          }
          else {
              console.log(response);
              var elServiceGroups = document.querySelector(".onsched-wizard.onsched-form select[name=serviceGroupId]");
              elServiceGroups.innerHTML = OnSchedTemplates.resourceGroupOptions(response.data);
              // template the resourcegroup select
          }
      }) // end rest response
  ); // end promise           
}
