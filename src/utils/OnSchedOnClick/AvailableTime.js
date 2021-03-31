import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'


export const AvailableTime = (event, element) => {
  var timeClicked = event.target;
  element.timerId = null;
  var postData = new Object();
  postData.locationId = element.params.locationId;
  postData.serviceId = "" + element.params.serviceId;
  postData.resourceId = "" + timeClicked.dataset.resourceid;
  postData.startDateTime = timeClicked.dataset.startdatetime;
  postData.endDateTime = timeClicked.dataset.enddatetime;
  if (OnSchedHelpers.IsEmpty(element.params.customerId) === false)
      postData.customerId = element.params.customerId;

  OnSchedHelpers.ShowProgress();
  // Invoke POST /appointments endpoint
  var appointmentsUrl = element.onsched.apiBaseUrl + "/appointments";
  if (OnSchedHelpers.IsNotEmpty(element.params.completeBooking) &&
      OnSchedHelpers.IsNotEmpty(element.params.customerId)) {
      appointmentsUrl = OnSchedHelpers.AddUrlParam(appointmentsUrl, "completeBooking", element.params.completeBooking);
  }

  // TWO DIFFERENT FLOWS ARE POSSIBLE
  // 1. Render the booking form
  // 2. Complete the booking, with supplied information


  element.onsched.accessToken.then(x =>
      OnSchedRest.Post(x, appointmentsUrl, postData, function (response) {
          OnSchedResponse.PostAppointment(element, response);
      })
  );
}
