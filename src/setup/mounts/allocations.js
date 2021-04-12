import { OnSchedResponse }      from '../../OnSchedResponse'
import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'


export const AllocationsElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  
  var url = element.onsched.setupApiBaseUrl + `/services/${element.params.serviceId}/allocations`;
  
  delete element.params.serviceId

  Object.entries(element.params).map(param => {
      url = OnSchedHelpers.AddUrlParam(url, param[0], param[1]) 
  })
  
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          OnSchedResponse.GetAllocations(element, response);
      })
  );
}

export const AllocationSetupElement = element => {
  var el = document.getElementById(element.id);

  // check for presence of id in params
  // if exists, then make get call and build UI with response data
  // otherwise
  // creating a fresh allocation, use defaults incoming in params
  var date = new Date().toISOString().slice(0, 10)

  var defaultData = {
      locationId: '',
      resourceId: '',
      startDate: date,
      endDate: date,
      startTime: 900,
      endTime: 1700,
      reason: '',
      bookingLimit: 0,
      allDay: false,
      repeats: false,
      repeat: {
          frequency: 'D',
          interval:  1,
          weekdays:  '',
          monthDay:  '1',
          monthType: 'D'
        },
  }

  let data = defaultData;

  if (!element.params.id) {
      if (element.params.data) {
          data = Object.assign(defaultData, element.params.data);
      }

      el.innerHTML = OnSchedTemplates.allocationSetup(element, data);

      OnSchedWizardHelpers.InitWizardDomElements(element);
      OnSchedWizardHelpers.InitAllocationDomElements(element);
      OnSchedWizardHelpers.ShowWizardSection(0);
  }
  else {
      var urlAllocation = element.onsched.setupApiBaseUrl + `/services/allocations/${element.params.id}`;
      OnSchedHelpers.ShowProgress();
      element.onsched.accessToken.then(x =>
          OnSchedRest.Get(x, urlAllocation, function (response) {
              if (response.error) {
                  console.log("Error response=" + response.code);
                  return;
              }

              // now render the initial UI from the response data
              el.innerHTML = OnSchedTemplates.allocationSetup(element, response);                    

              OnSchedWizardHelpers.InitWizardDomElements(element);
              OnSchedWizardHelpers.InitAllocationDomElements(element, response);
              OnSchedWizardHelpers.ShowWizardSection(0);
          }) // end rest response
      ); // end promise     
  }
}
