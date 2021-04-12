import { OnSchedRest } from '../../../OnSchedRest'

export const InitLocationDomElements = element => {
  // move some code from the InitWizardDomElements

      // Business Hours and Timezone dropdown options
      var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
      var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
      elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;
      elBusinessTimezone.addEventListener("change", function(event) {
          var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
          var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
          elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;

      }, false);

      // Call the endpoint to receive all system states
      // and use data to populate the states options and country options

      var urlCustomerStates = element.onsched.apiBaseUrl + "/customers/states";

      element.onsched.accessToken.then(x =>
          OnSchedRest.Get(x, urlCustomerStates, function (response) {
              var stateOptionsHtml = OnSchedTemplates.stateSelectOptions(response);
              var elStateSelect = document.querySelector(".onsched-wizard.onsched-form select[name=state]");
              elStateSelect.innerHTML = stateOptionsHtml;
              elStateSelect.value = element.params.data.address.state;
              var countryOptionsHtml = OnSchedTemplates.countrySelectOptions(response);
              var elCountrySelect = document.querySelector(".onsched-wizard.onsched-form select[name=country]");
              elCountrySelect.innerHTML = countryOptionsHtml;
              elCountrySelect.value = element.params.data.address.country;    
          }) // end rest response
      ); // end promise    
}
