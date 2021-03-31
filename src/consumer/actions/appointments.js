import { OnSchedOnClick } from '../../utils/OnSchedOnClick'

export const AppointmentsList = (element, response) => {
  var eventModel;
  var getAppointmentsEvent;
  if (response.error || response.count === 0) {
      eventModel = { message: 'No appointments found matching search input.' };
      getAppointmentsEvent = new CustomEvent("notFound", { detail: eventModel });
      var el = document.getElementById(element.id);
      el.dispatchEvent(getAppointmentsEvent);
      return;
  }
  var htmlAppointments = OnSchedTemplates.appointmentsList(response);
  var el = document.getElementById(element.id);
  el.innerHTML = htmlAppointments;
}

export const CreateAppointment = (element, response) => {
  // POST appointment now supports two flows
  // 1. Render a booking form, then do a PUT operation to complete later
  // 2. Complete the booking with the information supplied

  if (OnSchedHelpers.IsEmpty(element.params.completeBooking) || OnSchedHelpers.IsEmpty(element.params.customerId)) {
      // Flow 1 - render the booking flow
      // Render the booking form here
      var elBookingFormContainer = document.querySelector(".onsched-booking-form-container");
      elBookingFormContainer.innerHTML = OnSchedTemplates.bookingForm(response, element.options, element.onsched.locale);
      var elPopup = document.querySelector(".onsched-popup-shadow");
      elPopup.classList.add("is-visible");
      element.timerId = OnSchedHelpers.StartBookingTimer(element.timerId, ".onsched-popup-header .booking-timer");

      var elFormShadow = document.querySelector(".onsched-popup-shadow.is-visible");
      elFormShadow.addEventListener("click", function (event) {
          if (event.target.classList.contains("onsched-close-btn") ||
              event.target.classList.contains("onsched-popup-shadow") ||
              event.target.classList.contains("btn-cancel")) {
              OnSchedOnClick.BookingFormCancel(event, element);
          }
      });

      var elBookingForm = document.querySelector(".onsched-form.booking-form");
      elBookingForm.addEventListener("keyup", e => {
          // if we press the ESC
          if (e.key == "Escape") {
              OnSchedOnClick.BookingFormCancel(e, element);
          }
      });
      elBookingForm.addEventListener("submit", function (e) {
          e.preventDefault(); // before the code
          OnSchedOnClick.BookingFormSubmit(e, element);
      });
  }
  else {
      // Flow 2 - completed booking with information supplied
      // Fire event to the element to notify of booking complete
      var elAvailability = document.getElementById(element.id);
      var bookingConfirmationEvent = new CustomEvent("bookingConfirmation", { detail: response });
      elAvailability.dispatchEvent(bookingConfirmationEvent);
  }
}

export const BookAppointment = (element, response) => {
    var elCloseBtn = document.querySelector(".onsched-close-btn");

    clearInterval(element.timerId);
    if (response.error) {
        if (response.validation) {
            console.log(response.validation);
            console.log(response.code);
            console.log(response.data);
            var errorBoxParams = { code: response.code, message: response.data.error };
            var errorContainer = document.querySelector(".onsched-error-container");
            errorContainer.innerHTML = OnSchedTemplates.errorBox(errorBoxParams);
            elCloseBtn.click(); // simulate click of close button
        }
        else {
            console.log(response.code);
            console.log(response.data);
            elCloseBtn.click(); // simulate click of close button
        }
    }
    else {
        document.querySelector(".onsched-popup-shadow").classList.remove("is-visible");

        // clear out the availbility container
        var elAvailabilityContainer = document.querySelector(".onsched-container.onsched-availability")
        elAvailabilityContainer.innerHTML = "";

        // Need logic here to check if overriding the bookingConfirmation.

        if (element.options.bookingConfirmation != null && element.options.bookingConfirmation.suppressUI) {
            console.log("Suppress UI in BookingConfirmation")
        }
        else {
            var bookingConfirmationHtml = OnSchedTemplates.confirmation(response, element.onsched.locale);
            var elBookingConfirmationContainer = document.querySelector(".onsched-booking-confirmation-container");
            elBookingConfirmationContainer.innerHTML = bookingConfirmationHtml;    
        }

        // fire client event to inform of bookingConfirmation with response data
        var elAvailability = document.getElementById(element.id);
        var bookingConfirmationEvent = new CustomEvent("bookingConfirmation", { detail: response });
        elAvailability.dispatchEvent(bookingConfirmationEvent);
    }
}
