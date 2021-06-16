import { loading }                     from '../../utils/LoadingHelpers'
import { createOnSchedElement }        from '../../utils/IdentifierHelpers'
import { availabilityTemplate }        from '../../templates/availability'
import { serviceMount, servicesMount } from '../services';
import { removeElementFromRoot }       from '../../utils/RootHelpers';
import { mountStripePayment }          from '../stripe';
import { createGoogleMap }             from '../../utils/GoogleMapHelpers';


// Initialize OnSched with clientId and environment 
var onsched = OnSched("sbox1621548569", "sbox");

// Get instance of elements to use for creating elements
var elements = onsched.elements();

export const availabilityMount = (availabilityParams = {}, availabilityOptions = {}) => {
  var elRoot = document.getElementById('root');

  availabilityOptions.groupSize = true;
  const availabilityAction = service => {
    createOnSchedElement('availability-container', 'event-page').then(() => {
      createOnSchedElement('availability', 'availability-container').then(e => {
        // Create google map 
          // Requires "location" property on 
          // the Service object in OnSchedApi
        createOnSchedElement('google-map', 'availability-container').then(elMap => createGoogleMap(elMap))

        var availability = elements.create('availability', availabilityParams, availabilityOptions);
        
        var elAvailability = e;

        elAvailability.addEventListener('getAvailability', e => {
          loading(false)
          var elBackBtn = document.createElement('BUTTON');
          elBackBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
          elBackBtn.id = 'back-btn';
          elBackBtn.className = 'back-btn';
          elBackBtn.onclick = () => {
            removeElementFromRoot('event-page')
              .then(() => removeElementFromRoot('availability')
              .then(() => elBackBtn.remove())
              .then(() => servicesMount()))
          };
          
          document.getElementById('petes-availability').innerHTML = availabilityTemplate(e.detail, service);

          if (!document.getElementById('back-btn'))
            elRoot.prepend(elBackBtn);
        })

        elAvailability.addEventListener('bookingConfirmation', e => {
          mountStripePayment(e.detail);
        })
      
        availability.mount('availability');
        loading(true);
      });
    });
  }

  if (availabilityParams.serviceId)
    serviceMount({serviceId: availabilityParams.serviceId}).then(availabilityAction)
  else
    availabilityAction()
}
