import { loading }                     from '../../utils/LoadingHelpers'
import { createOnSchedElement }        from '../../utils/IdentifierHelpers'
import { availabilityTemplate }        from '../../templates/availability'
import { serviceMount, servicesMount } from '../services';
import { removeElementFromRoot }       from '../../utils/RootHelpers';
import { mountStripePayment }          from '../stripe';


// Initialize OnSched with clientId and environment 
var onsched = OnSched("sbox1621548569", "sbox");

// Get instance of elements to use for creating elements
var elements = onsched.elements();

export const availabilityMount = (availabilityParams = {}, availabilityOptions = {}) => {
  const availabilityAction = service => {
    createOnSchedElement('availability').then(e => {
      var availability = elements.create('availability', availabilityParams, availabilityOptions);
      
      var elAvailability = e;

      elAvailability.addEventListener('getAvailability', e => {
        loading(false)
        var elBackBtn = document.createElement('BUTTON');
        elBackBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
        elBackBtn.className = 'back-btn';
        elBackBtn.onclick = () => {
          removeElementFromRoot('petes-availability')
            .then(() => removeElementFromRoot('availability')
            .then(() => servicesMount()))
        };
        
        document.getElementById('petes-availability').innerHTML = availabilityTemplate(e.detail, service);
        document.getElementById('petes-availability').prepend(elBackBtn);
      })

      elAvailability.addEventListener('bookingConfirmation', e => {
        mountStripePayment(e.detail);
      })
    
      availability.mount('availability');
      loading(true);
    });
  }

  if (availabilityParams.serviceId)
    serviceMount(availabilityParams.serviceId).then(availabilityAction)
  else
    availabilityAction()
}
