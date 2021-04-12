import { OnSchedRest }    from '../../OnSchedRest'
import { OnSchedHelpers } from '../OnSchedHelpers'


export const SearchedAppointment = (element, apptId) => {
  OnSchedHelpers.ShowProgress();

  var appointmentsUrl = element.onsched.apiBaseUrl + "/appointments/" + apptId;

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, appointmentsUrl, function (response) {
          var getAppointmentEvent = new CustomEvent("getAppointment", { detail: response });
          var elAppointments = document.getElementById('appointments');
          elAppointments.dispatchEvent(getAppointmentEvent);
          OnSchedHelpers.OpenAppointmentsModal(response, element);
      })
  );

}
