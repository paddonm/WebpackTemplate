import { OnSchedResponse }      from '../../OnSchedResponse'
import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'


export const ResourceElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  // url depends on getFirst or by serviceId
  if (element.params.resourceId != null && element.params.resourceId.length > 0)
      url = element.onsched.apiBaseUrl + "/resources/" + element.params.resourceId;
  else
  if (element.options.getFirst) {
      url = element.onsched.apiBaseUrl + "/resources";
      url = element.params.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
  }
  else
      return;

  var url = element.params.locationId != null && element.params.locationId.length > 0 ?
      OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

  // We built a url so call the endpoint now
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getResourceEvent;
          var elResource = document.getElementById(element.id);
          if (response.object == "resource") {
              getResourceEvent = new CustomEvent("getResource", { detail: response });
              elResource.dispatchEvent(getResourceEvent);
          }
          else {
              if (response.count > 0) {
                  var resource = response.data[0]; // take the first resource returned
                  getResourceEvent = new CustomEvent("getResource", { detail: resource });
                  elResource.dispatchEvent(getResourceEvent);
              }
          }
      }) // end rest response
  ); // end promise
} 

export const ResourceSetupElement = element => {

    var el = document.getElementById(element.id);

    // check for presence of id in params
    // if exists, then make get call and build UI with response data
    // otherwise
    // creating a fresh resource, use defaults incoming in params.data or
    // use the system defaults created here.

    var defaultAvailability = {
        "mon": { "startTime": 900, "endTime": 1700 },
        "tue": { "startTime": 900, "endTime": 1700 },
        "wed": { "startTime": 900, "endTime": 1700 },
        "thu": { "startTime": 900, "endTime": 1700 },
        "fri": { "startTime": 900, "endTime": 1700 },
        "sat": { "startTime": 0, "endTime": 0 },
        "sun": { "startTime": 0, "endTime": 0 },
    };

    var defaultData = { 
        name:"Test Resource", 
        address: { 
            city: "", 
            postalCode : "", 
            state: "ON", 
            country: "CA", 
            addressLine1: "", 
            addressLine2: "" 
        }, 
        timezoneName: "America/Toronto", 
        contact: {
            businessPhone: "", 
            mobilePhone: "", 
            homePhone: "", 
            preferredPhoneType: ""
        }, 
        availability: defaultAvailability, 
        settings: {}
    };

    var customFields = [];
    if (element.options.customFields) {
        customFields = element.options.customFields;
    }
    
    if (element.options.suppressUI) {
        if (element.params.data) {
            if (element.params.id && element.params.id.length) {
                var resourceUrl = element.onsched.setupApiBaseUrl + "/resources/" + element.params.id;
                element.onsched.accessToken.then(x =>
                    OnSchedRest.Put(x, resourceUrl, element.params.data, function (response) {
                        OnSchedResponse.PutResource(element, response);
                    })
                );    
            }
            else {
                var resourceUrl = element.onsched.setupApiBaseUrl + "/resources";
                element.onsched.accessToken.then(x =>
                    OnSchedRest.Post(x, resourceUrl, element.params.data, function (response) {
                        OnSchedResponse.PutResource(element, response);
                    })
                );    
            }
        }
        else {
            console.log("Data object must be supplied to resourceSetupParams to supress the UI");
        }
    }
    else if (element.params.id == undefined || element.params.id.length == 0) {
        if (element.params.data == undefined)
            el.innerHTML = OnSchedTemplates.resourceSetup(element, defaultData, customFields);
        else {
            // make sure the supplied default data passed in params has availability
            // if not, we'll use our default availability
            if (element.params.data.availability == undefined)
                element.params.data.availability = defaultAvailability;
            if (element.params.data.contact == undefined)
                element.params.data.contact = {};

            el.innerHTML = OnSchedTemplates.resourceSetup(element, element.params.data, customFields);
        }
        OnSchedWizardHelpers.InitWizardDomElements(element);
        OnSchedWizardHelpers.InitResourceDomElements(element);
        OnSchedWizardHelpers.ShowWizardSection(0);
        // default the timezone for a new resource
        if (element.params.tzOffset != undefined || element.params.tzOffset.length == 0) {
            var elTimezoneSelect = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName");
//                elTimezoneSelect.value = element.params.tzOffset;
            elTimezoneSelect.value = "";
        }
    }
    else {
        var urlResource = element.onsched.apiBaseUrl + "/resources/" + element.params.id;
        OnSchedHelpers.ShowProgress();
        element.onsched.accessToken.then(x =>
            OnSchedRest.Get(x, urlResource, function (response) {
                if (response.error) {
                    console.log("Rest error response code=" + response.code);
                    return;
                }
                console.log(response);
                // now render the initial UI from the response data
                el.innerHTML = OnSchedTemplates.resourceSetup(element, response, element.options.customFields);                    
                OnSchedWizardHelpers.InitWizardDomElements(element);
                OnSchedWizardHelpers.InitResourceDomElements(element);
                OnSchedWizardHelpers.SelectOptionMatchingData("select[name=timezoneName]", "tz", response.timezoneIana);

                OnSchedWizardHelpers.ShowWizardSection(0);
            }) // end rest response
        ); // end promise     
    }
       
}
