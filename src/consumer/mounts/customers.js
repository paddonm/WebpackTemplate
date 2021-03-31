import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const CustomerElement = element => {
  // When I mount customer and have everything, I can immediately do a customer post
  // then I can fire an event and return the customerId created.
  // Normal flow, form loads on mount and wait for a Submit
  // Alternate flow, customer data exists so just POST the customer with supplied data
  // It still happens on mount because I also need to send event back to the customer element
  // What if the same customer booking second time around. Avalailability could provide the 
  // customerId. 
  var url = element.onsched.apiBaseUrl + "/customers";
  url = OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId);
  url = OnSchedHelpers.AddUrlParam(url, "email", element.params.email);
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          OnSchedResponse.GetCustomers(element, response);
      })
  );
}
