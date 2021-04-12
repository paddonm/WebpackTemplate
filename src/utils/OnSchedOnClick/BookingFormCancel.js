import { OnSchedRest } from '../../OnSchedRest'

export const BookingFormCancel = (event, element) => {
  document.querySelector(".onsched-popup-shadow").classList.remove("is-visible");
  var id = document.querySelector(".onsched-form.booking-form input[name=id]").value;
  var appointmentsUrl = element.onsched.apiBaseUrl + "/appointments/" + id;
  clearInterval(element.timerId);
  element.onsched.accessToken.then(x =>
      OnSchedRest.Delete(x, appointmentsUrl, function (response) {
//                console.log("Initial Appointment Deleted");
      }));
}
