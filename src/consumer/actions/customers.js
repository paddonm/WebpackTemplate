import { OnSchedRest } from '../../OnSchedRest'

export const CreateCustomer = (element, response) => {
  if (response.count == 0) {
      // here is where I may need to do a POST to create the customer
      if (element.params.customerIM != null) {
          var url = element.onsched.apiBaseUrl + "/customers";
          element.onsched.accessToken.then(x =>
              OnSchedRest.Post(x, url, element.params.customerIM, function (response) {
                  var createCustomerEvent = new CustomEvent("postCustomer", { detail: response });
                  var elCustomer = document.getElementById(element.id);
                  elCustomer.dispatchEvent(createCustomerEvent);
              })
          );
      }
      else
          throw new Error("Customer not found");
  }
  if (response.count > 0) {
      // fire a custom event here
      var getCustomerEvent = new CustomEvent("getCustomer", { detail: response.data[0] });
      var getCustomersEvent = new CustomEvent("getCustomers", { detail: response });
      var elCustomer = document.getElementById(element.id);
      elCustomer.dispatchEvent(getCustomerEvent);
      elCustomer.dispatchEvent(getCustomersEvent);
  }
}
