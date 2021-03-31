import moment from 'moment'

export const OpenAppointmentsModal = (response, element) => {
  var tableFields = [
    {
      label: 'Name',
      value: response.name
    },
    {
      label: 'Date/Time',
      value: moment(response.startDateTime).format('llll')
    },
    {
      label: 'Service/Duration',
      value: response.serviceName + ' ' + response.duration + ' min'
    },
    {
      label: 'Resource',
      value: response.resourceName
    },
    {
      label: 'Phone',
      value: response.phone
    },
    {
      label: 'Location',
      value: response.location
    },
    {
      label: 'Notes',
      value: response.notes ? response.notes : ''
    },
    {
      label: 'Customer message',
      value: response.customerMessage
    },
    {
      label: 'Status',
      value: response.status
    },
    {
      label: 'Confirmed',
      value: `${response.confirmed}/${response.confirmationNumber}`
    },
    {
      label: 'Booked by',
      value: `${response.bookedBy}`
    },
    {
      label: 'Email',
      value: `${response.email}`
    },
    {
      label: 'Booked on',
      value: `${moment(response.createDate).format('llll')}`
    },
  ]

  var elModal = document.getElementById('appointments-modal');
  elModal.innerHTML = OnSchedTemplates.appointmentsModal(response.name, tableFields, response.auditTrail);
  
  var elPopup = document.querySelector('#appointments-modal .onsched-popup-shadow');
  elPopup.classList.add('is-visible');
  
  var elShadow = document.querySelector(".onsched-popup-shadow.is-visible");

  elShadow.addEventListener("click", e => {
    if (e.target.tagName === 'DIV') {
      elShadow.classList.remove('is-visible');
      elModal.innerHTML = '';
    }       
  });

  var url = element.onsched.apiBaseUrl + "/appointments/" + response.id + "/cancel";
  
  var elAppointments = document.getElementById(`appointments`)
  var footerLinks = document.querySelectorAll('#appointments-modal .onsched-popup-footer a');

  if (response.status !== 'CN') {
    footerLinks[0].onclick = null;
    footerLinks[0].onclick = () => {
      elShadow.classList.remove('is-visible');
      elModal.innerHTML = '';
      OnSchedHelpers.ShowProgress();
      element.onsched.accessToken.then(x =>
        OnSchedRest.PutAppointmentCancel(x, url, {}, detail => {
          OnSchedMount.AppointmentsElement(element);
          OnSchedHelpers.HideProgress();
          var cancelAppointmentEvent = new CustomEvent("cancelAppointment", { detail });
          elAppointments.dispatchEvent(cancelAppointmentEvent);
        })
      );
    };
    if (!response.confirmed) {
      footerLinks[1].onclick = () => {
        var confirmUrl = element.onsched.apiBaseUrl + "/appointments/" + response.id + "/confirm"
        elShadow.classList.remove('is-visible');
        elModal.innerHTML = '';
        OnSchedHelpers.ShowProgress();

        element.onsched.accessToken.then(x => 
          OnSchedRest.Put(x, confirmUrl, {}, detail => {
            if (detail.error) {
              console.log("Rest error response code=" + detail.code);
            }
            else {
              OnSchedHelpers.HideProgress();
              var confirmAppointmentEvent = new CustomEvent("confirmAppointment", { detail });
              elAppointments.dispatchEvent(confirmAppointmentEvent);  
            }
          }) // end rest response
        ); // end promise
      };
    }
    else {
      footerLinks[1].className = 'disabled';
      footerLinks[1].disabled = true;
    }
  }
  else {
    footerLinks[0].className = 'disabled';
    footerLinks[0].disabled = true;
    footerLinks[1].className = 'disabled';
    footerLinks[1].disabled = true;
  }
}
