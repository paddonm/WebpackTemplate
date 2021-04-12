import { OnSchedRest }          from '../../../OnSchedRest'
import { OnSchedWizardHelpers } from '../OnSchedWizardHelpers'

export const InitResourceDomElements = element => {

  // Business Hours and Timezone dropdown options
  var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
  var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
  elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;
  elBusinessTimezone.addEventListener("change", function(event) {
      var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
      var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
      elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;

  }, false);

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

  // make a rest call to populate the resourceGroup select on the form
  var locationId = element.params.locationId == undefined ? "" : locationId; 
  var urlResourceGroups = element.onsched.setupApiBaseUrl + "/resourcegroups";
  urlResourceGroups = OnSchedHelpers.AddUrlParam(urlResourceGroups, "locationId", locationId);

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, urlResourceGroups, function (response) {
          if (response.error) {
              console.log("Rest error response code=" + response.code);
          }
          else {
              console.log(response);
              var elResourceGroups = document.querySelector(".onsched-wizard.onsched-form select[name=groupId]");
              elResourceGroups.innerHTML = OnSchedTemplates.resourceGroupOptions(response.data);
              // template the resourcegroup select
          }
      }) // end rest response
  ); // end promise           
  
  // Call the endpoint to receive all system states
  // and use data to populate the states options and country options

  var urlCustomerStates = element.onsched.apiBaseUrl + "/customers/states";

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, urlCustomerStates, function (response) {
          var stateOptionsHtml = OnSchedTemplates.stateSelectOptions(response);
          var elStateSelect = document.querySelector(".onsched-wizard.onsched-form select[name=state]");
          elStateSelect.innerHTML = stateOptionsHtml;
          var countryOptionsHtml = OnSchedTemplates.countrySelectOptions(response);
          var elCountrySelect = document.querySelector(".onsched-wizard.onsched-form select[name=country]");
          elCountrySelect.innerHTML = countryOptionsHtml;
          
          if (element.params.data) {
              elStateSelect.value = element.params.data.address.state;
              elCountrySelect.value = element.params.data.address.country;    
          }
      }) // end rest response
  ); // end promise       

}
