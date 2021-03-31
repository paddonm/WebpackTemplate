import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'


export const LocationElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  var url = element.onsched.apiBaseUrl + "/locations/" + element.params.locationId;

  if (element.params.locationId === null || element.params.locationId.length === 0)
      return;

  // We built a url so call the endpoint now
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getLocationEvent = new CustomEvent("getLocation", { detail: response });
          el.dispatchEvent(getLocationEvent);
      }) // end rest response
  ); // end promise
  return;
}

export const LocationSetupElement = element => {
  var el = document.getElementById(element.id);
  // check for presence of id in params
  // if exists, then make get call and build UI with response data
  // otherwise

  // creating a fresh location, use defaults incoming in params.data or
  // use the system defaults created here.

  var defaultBusinessHours = {
      "mon": { "startTime": 900, "endTime": 1700 },
      "tue": { "startTime": 900, "endTime": 1700 },
      "wed": { "startTime": 900, "endTime": 1700 },
      "thu": { "startTime": 900, "endTime": 1700 },
      "fri": { "startTime": 900, "endTime": 1700 },
      "sat": { "startTime": 0, "endTime": 0 },
      "sun": { "startTime": 0, "endTime": 0 },
  };

  var defaultData = { address:{ "state": "ON", "country": "CA" }, businessHours: defaultBusinessHours, settings: {}, options: { wizardSections: []}};

  if (element.params.id == undefined) {
      // build the base html template for this wizard
      if (element.params.data == undefined)
          el.innerHTML = OnSchedTemplates.locationSetup(element, defaultData);
      else {
          // make sure the supplied default data passed in params has busnessHours
          // if not, we'll use our default businessHours
          if (element.params.data.businessHours == undefined)
              element.params.data.businessHours = defaultBusinessHours;
          el.innerHTML = OnSchedTemplates.locationSetup(element, element.params.data);
      }
      OnSchedWizardHelpers.InitWizardDomElements(element);
      OnSchedWizardHelpers.InitLocationDomElements(element);
      OnSchedWizardHelpers.ShowWizardSection(0);
      // default the timezone for a new location
      if (element.params.tzOffset != undefined || element.params.tzOffset.length == 0) {
          var elTimezoneSelect = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName");
          elTimezoneSelect.value = element.params.tzOffset;
      }
  }   
  else {
      var urlLocation = element.onsched.apiBaseUrl + "/locations/" + element.params.id;

      OnSchedHelpers.ShowProgress();
      element.onsched.accessToken.then(x =>
          OnSchedRest.Get(x, urlLocation, function (response) {
              if (response.error) {
                  console.log("Rest error response code=" + response.code);
                  return;
              }
              // now render the initial UI from the response data
              el.innerHTML = OnSchedTemplates.locationSetup(element, response);                    
              OnSchedWizardHelpers.InitWizardDomElements(element);
              OnSchedWizardHelpers.InitLocationDomElements(element);
              OnSchedWizardHelpers.SelectOptionMatchingData("select[name=timezoneName]", "tz", response.timezoneIana);

              OnSchedWizardHelpers.ShowWizardSection(0);
          }) // end rest response
      ); // end promise        
  }
}
