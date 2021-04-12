import { OnSchedRest }           from '../../OnSchedRest'
import { OnSchedResponse }       from '../../OnSchedResponse'
import { GetLocationPostData }   from './format/GetLocationPostData'
import { GetLocationPutData }    from './format/GetLocationPutData'
import { GetResourcePostData }   from './format/GetResourcePostData'
import { GetResourcePutData }    from './format/GetResourcePutData'
import { GetServicePostData }    from './format/GetServicePostData'
import { GetServicePutData }     from './format/GetServicePutData'
import { GetAllocationPostData } from './format/GetAllocationPostData'
import { ShowWizardSection } from './ShowWizardSection'
  

export const WizardSubmitHandler = (event, element) => {
  var elStep = document.querySelector(".onsched-wizard input[name=step]")
  var step = parseInt(elStep.value);
  var elWizardSections = document.querySelectorAll(".onsched-wizard .onsched-wizard-section");

  if (step == elWizardSections.length - 1) {
      var form = document.querySelector(".onsched-wizard.onsched-form");
      console.log("In WizardSubmitHandler form="+form.getAttribute("name"));
      switch(form.getAttribute("name")) {
          case "locationSetup":
              if (element.params.id == undefined || element.params.id.length == 0) {
                  console.log("POST /locations");
                  var postData = GetLocationPostData(form.elements);
                  var locationsUrl = element.onsched.setupApiBaseUrl + "/locations";
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Post(x, locationsUrl, postData, function (response) {
                          OnSchedResponse.PostLocation(element, response);
                      })
                  );
              }
              else {
                  var putData = GetLocationPutData(form.elements);
                  var locationsUrl = element.onsched.setupApiBaseUrl + "/locations/"+ element.params.id;
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Put(x, locationsUrl, putData, function (response) {
                          OnSchedResponse.PutLocation(element, response);
                      })
                  );                        
              }
              break;
          case "resourceSetup":
              if (element.params.id == undefined || element.params.id.length == 0) {
                  var postData = GetResourcePostData(form.elements, element);
                  var resourcesUrl = element.onsched.setupApiBaseUrl + "/resources";
                  resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "googleAuthReturnUrl", element.params.googleAuthReturnUrl);
                  resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "outlookAuthReturnUrl", element.params.googleAuthReturnUrl);
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Post(x, resourcesUrl, postData, function (response) {
                          OnSchedResponse.PostResource(element, response);
                      })
                  );
              }
              else {
                  var putData = GetResourcePutData(form.elements, element);
                  var resourceUrl = element.onsched.setupApiBaseUrl + "/resources/" + element.params.id;
                  resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "googleAuthReturnUrl", element.params.googleAuthReturnUrl);
                  resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "outlookAuthReturnUrl", element.params.googleAuthReturnUrl);
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Put(x, resourceUrl, putData, function (response) {
                          OnSchedResponse.PutResource(element, response);
                      })
                  );                        
              }                        
          break;
          case "serviceSetup":
              if (element.params.id == undefined || element.params.id.length == 0) {
                  var postData = GetServicePostData(form.elements, element);
                  var servicesUrl = element.onsched.setupApiBaseUrl + "/services";
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Post(x, servicesUrl, postData, function (response) {
                          OnSchedResponse.PostService(element, response);
                          let calendarId = response.calendarId;
                          if (element.params.calendarId) {
                              calendarId = element.params.calendarId;
                          }

                          let calData = {
                              calendarId, 
                              locationId: response.locationId, 
                              serviceId: response.id
                          }
                          
                          let linkedServiceUrl = element.onsched.setupApiBaseUrl + "/services/calendar"
                          element.onsched.accessToken.then(x =>
                              OnSchedRest.Post(x, linkedServiceUrl, calData, function (linkedResponse) {})
                          );
                      })
                  );
              }
              else {
                  var putData = GetServicePutData(form.elements, element);
                  var servicesUrl = element.onsched.setupApiBaseUrl + "/services/" + element.params.id;
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Put(x, servicesUrl, putData, function (response) {
                          OnSchedResponse.PutService(element, response);
                      })
                  );     
              }
              break;
          case "allocationSetup":
              var postData = GetAllocationPostData(form.elements);
              
              if (!element.params.id) {
                  var allocationsUrl = element.onsched.setupApiBaseUrl + `/services/${element.params.serviceId}/allocations`;
                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Post(x, allocationsUrl, postData, function (response) {
                          OnSchedResponse.PostAllocation(element, response);
                      })
                  );
              }
              else {
                  var allocationsUrl = element.onsched.setupApiBaseUrl + "/services/allocations/" + element.params.id;
                  var putData = GetAllocationPostData(form.elements);

                  OnSchedHelpers.ShowProgress();
                  element.onsched.accessToken.then(x =>
                      OnSchedRest.Put(x, allocationsUrl, putData, function (response) {
                          OnSchedResponse.PutAllocation(element, response);
                      })
                  );
              }
              break;
           default:
              console.log("WizardSubmtHandler: unknown form submitted"+ " "+ form.name);         
      }            
  }
  else {
      // update the new step value
      step = step + 1;
      elStep.value = step;
      ShowWizardSection(step);
  }

  event.preventDefault();
  
  return false;
}
