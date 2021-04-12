import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'


export const BookingFormSubmit = (event, element) => {
  var appointmentBM = {};
  var appointmentBookingFields = [];
  var customerBookingFields = [];
  var lastname, firstname;
  var form = document.querySelector(".onsched-form.booking-form");

  for (var i = 0; i < form.elements.length; i++) {
      var e = form.elements[i];
      if (OnSchedHelpers.IsEmpty(e.name))
          continue;
      if (e.type === "hidden")
          continue;
      if (e.name === "name")
          appointmentBM[e.name] = e.value;
      else
      if (e.name === "firstname")
          firstname = e.value;
      else
      if (e.name === "lastname")
          lastname = e.value;
      else {
          // need to handle booking fields different than other form fields
          if (e.dataset.bookingfield == "appointment" || e.dataset.bookingfield == "customer") {
              var bookingField = {};        
              bookingField["name"] = e.name;
              bookingField["value"] = e.value;  
              if (e.dataset.bookingfield == "appointment")
                  appointmentBookingFields.push(bookingField);
              else
                  customerBookingFields.push(bookingField);
          }
          else
              appointmentBM[e.name] = e.value;
      }
  }

  var name = "";
  if (OnSchedHelpers.IsEmpty(firstname) === false)
      name = firstname + " ";
  if (OnSchedHelpers.IsEmpty(lastname) === false)
      name += lastname;
  if (OnSchedHelpers.IsEmpty(name) === false)
      appointmentBM["name"] = name;

  appointmentBM.appointmentBookingFields = appointmentBookingFields;
  appointmentBM.customerBookingFields = customerBookingFields;

  if (element.params.appointmentBM != null) {
      console.log(element.params.appointmentBM);
      appointmentBM.customFields = element.params.appointmentBM.customFields;
  }

  var id = document.querySelector(".onsched-form.booking-form input[name=id]").value;
  var url = element.onsched.apiBaseUrl + "/appointments/" + id + "/book";

  element.onsched.accessToken.then(x =>
      OnSchedRest.Put(x, url, appointmentBM, function (response) {
          OnSchedResponse.PutAppointmentBook(element, response);
      }));
}
