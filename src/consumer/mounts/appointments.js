import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'
import { OnSchedOnClick }  from '../../utils/OnSchedOnClick'

export const AppointmentElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);

  // If updating the appointment to BOOKED call the PUT /appointments/{id}/book
  if (element.options.book) {
      // book option is set to we call the PUT /appointments/{id}/book
      var bookUrl = element.onsched.apiBaseUrl + "/appointments/" + element.params.appointmentId + "/book";
      var payload = {};
      // Check if appointmentBM object is passed in for payload
      if (element.params.appointmentBM) {
          payload = element.params.appointmentBM;
      }

      element.onsched.accessToken.then(x => 
          OnSchedRest.Put(x, bookUrl, payload, function(response) {
              if (response.error) {
                  console.log("Rest error response code=" + response.code);
              }
              else {
                  var bookingConfirmationEvent = new CustomEvent("bookingConfirmation", { detail: response });
                  el.dispatchEvent(bookingConfirmationEvent);
              }
              
          }) // end rest response
      ); // end promise
  }
  // If updating the appointment to CANCELLED call the PUT /appointments/{id}/cancel
  else if (element.options.cancel) {
      var cancelUrl = element.onsched.apiBaseUrl + "/appointments/" + element.params.appointmentId + "/cancel";
      var payload = {};
      // Check if appointmentBM object is passed in for payload
      if (element.params.appointmentBM) {
          payload = element.params.appointmentBM;
      }

      element.onsched.accessToken.then(x => 
          OnSchedRest.Put(x, cancelUrl, payload, function(response) {
              if (response.error) {
                  console.log("Rest error response code=" + response.code);
              }
              else {
                  var bookingCancellationEvent = new CustomEvent("bookingCancellation", { detail: response });
                  el.dispatchEvent(bookingCancellationEvent);
              }
              
          }) // end rest response
      ); // end promise
  }
  else if (element.options.create) {
      var createUrl = element.onsched.apiBaseUrl + "/appointments";

      element.onsched.accessToken.then(x => 
          OnSchedRest.Post(x, createUrl, element.params, function(response) {
              if (response.error) {
                  console.log("Rest error response code=" + response.code);
              }
              else {
                  var createAppointmentEvent = new CustomEvent("createAppointment", { detail: response });
                  el.dispatchEvent(createAppointmentEvent);
              }
              
          }) // end rest response
      ); // end promise
  }
  // If not confirming the appointment, then just fire an event with the response
  if (element.options.confirm == undefined || element.options.confirm == false) {
      if (element.params.appointmentId) {
          var getAppointmentEvent = new CustomEvent("getAppointment", { detail: response });
          el.dispatchEvent(getAppointmentEvent);
      }
  }
  else {
      // confirm option is set to we call the PUT /appointments/{id}/confirm
      var confirmUrl = element.onsched.apiBaseUrl + "/appointments/" + element.params.appointmentId + "/confirm";
      var payload = {};
      element.onsched.accessToken.then(x => 
          OnSchedRest.Put(x, confirmUrl, payload, function(response) {
              if (response.error) {
                  console.log("Rest error response code=" + response.code);
              }
              else {
                  var confirmAppointmentEvent = new CustomEvent("confirmAppointment", { detail: response });
                  el.dispatchEvent(confirmAppointmentEvent);  
              }
              
          }) // end rest response
      ); // end promise
  }
  return;
}

export const AppointmentsElement = element => {
    // are there any params or just options for appointments?
    // need to support lookup by postalCode. API changes.

    var el = document.getElementById(element.id);
    var url = element.onsched.apiBaseUrl + "/appointments";
    url = element.params.offset != null && element.params.offset.length ? OnSchedHelpers.AddUrlParam(url, "offset", element.params.offset) : url;
    url = element.params.limit != null && element.params.limit.length ? OnSchedHelpers.AddUrlParam(url, "limit", element.params.limit) : url;
    url = element.params.locationId != null && element.params.locationId.length ? OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

    if (element.params.searchText != null) {
        if (element.params.searchText.length) {
            if (!isNaN(element.params.searchText)) {
                if (element.params.searchText.length < 7)
                    url = OnSchedHelpers.AddUrlParam(url, "customerId", element.params.searchText);
                else
                    url = OnSchedHelpers.AddUrlParam(url, "phone", element.params.searchText);
            }
            else if (element.params.searchText.includes('@'))
                url = OnSchedHelpers.AddUrlParam(url, "email", element.params.searchText);
            else
                url = OnSchedHelpers.AddUrlParam(url, "lastName", element.params.searchText);
        }
    }
    
    element.params.formValues.map(formInput => {
        if (formInput && formInput.value && formInput.value.length) {
            url = OnSchedHelpers.AddUrlParam(url, formInput.paramName, formInput.value);
        }
    });
    
    //url = element.params.status != null && element.params.status.length ? OnSchedHelpers.AddUrlParam(url, "status", element.params.status) : url;
    //url = element.params.resourceId != null && element.params.resourceId.length ? OnSchedHelpers.AddUrlParam(url, "resourceId", element.params.resourceId) : url;
    //url = element.params.startDate != null && element.params.startDate.length ? OnSchedHelpers.AddUrlParam(url, "startDate", element.params.startDate) : url;
    //url = element.params.endDate != null && element.params.endDate.length ? OnSchedHelpers.AddUrlParam(url, "endDate", element.params.endDate) : url;
    OnSchedHelpers.ShowProgress();
    element.onsched.accessToken.then(x =>
        OnSchedRest.Get(x, url, function (response) {
            OnSchedResponse.GetAppointments(element, response);
            
            var clickSearchEvent = new CustomEvent("getAppointments", { detail: response });
            el.dispatchEvent(clickSearchEvent);
            
            var appointmentsList = document.querySelectorAll('[data-appointmentId]');
            Array.prototype.map.call(appointmentsList, appt => {
                appt.onclick = e => OnSchedOnClick.SearchedAppointment(element, appt.dataset.appointmentid);
            })
        })
    ).catch(e => console.log(e));
}

export const AppointmentSearchElement = element => {
    var el = document.getElementById(element.id);
    OnSchedHelpers.HideProgress();
    
    var url = element.onsched.apiBaseUrl + "/resources";
    url = element.options.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
    url = element.params.locationId !== null ? OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;
    
    let resources = elements.create("resources", {}, {})
    resources.onsched.accessToken.then(x =>
        OnSchedRest.Get(x, url, function (response) {
            element.params.resources = response.data;
            el.innerHTML = OnSchedTemplates.appointmentSearchForm(element.params);
            
            var elSearchForm = document.querySelector(".onsched-search-form");
            
            elSearchForm.addEventListener("submit", function (e) {
                e.preventDefault(); // before the code
                elAppointments.innerHTML = '';
                var elFormInputs = document.querySelectorAll(".onsched-filter-form input");
                var elFormSelects = document.querySelectorAll(".onsched-filter-form select");
                
                let allInputValues = Array.prototype.slice.call(elFormInputs).map(input => ({name: input.name, value: input.value, paramName: input.id}))
                let allSelectValues = Array.prototype.slice.call(elFormSelects).map(input => ({name: input.name, value: input.value, paramName: input.id}))
                let allValues = allInputValues.concat(allSelectValues)
                
                var elSearchText = document.querySelector(".onsched-search-form input[type=text]");
    
                var eventModel = { formValues: allValues, searchText: elSearchText.value.toLowerCase()};
                var clickSearchEvent = new CustomEvent("clicked", { detail: eventModel });
                el.dispatchEvent(clickSearchEvent);
            });
        })
    );
    
}
