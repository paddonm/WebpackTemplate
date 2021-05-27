import { createOnSchedElement }  from '../../utils/IdentifierHelpers'
import { servicesTemplate }      from '../../templates/services'
import { availabilityMount }     from '../availability'
import { addElementToRoot,
         removeElementFromRoot } from '../../utils/RootHelpers'
import { loading } from '../../utils/LoadingHelpers';


// Initialize OnSched with clientId and environment 
var onsched = OnSched("sbox1621548569", "sbox");

// Get instance of elements to use for creating elements
var elements = onsched.elements();

export const servicesMount = () => {
  createOnSchedElement('services').then(elServices => {
    var servicesParams = { locationId: '' };
    var servicesOptions = {};
    var services = elements.create('services', servicesParams, servicesOptions);
    
    elServices.style.display = 'none';
    
    elServices.addEventListener('getServices', e => {
      loading(false);

      addElementToRoot('petes-services')
        .then(petesServices => {
          petesServices.innerHTML = servicesTemplate(e.detail);
          
          var bookBtns = document.querySelectorAll('.service-item button');
          
          bookBtns.forEach(btn => btn.onclick = () => {
            let serviceId = btn.parentElement.parentElement.dataset.serviceid;
            
            removeElementFromRoot('petes-services')
              .then(() => {
                addElementToRoot('event-page')
                  .then(() => {
                    addElementToRoot('petes-availability', 'event-page')
                      .then(() => {
                        let availabilityParams = { locationId: '', serviceId, customerId: '', completeBooking: 'RS' };
                        let availabilityOptions = { groupSize: true };
        
                        availabilityMount(availabilityParams, availabilityOptions);
                      })
                  })
              });
          })
        })
    })
  
    loading(true);

    services.mount('services');
  });
}

export const serviceMount = (serviceParams) => {
  return new Promise((resolve, reject) => {
    createOnSchedElement('service').then(elService => {
      elService.style.display = 'none';
      
      var serviceOptions = { getFirst: true };
      var service = elements.create("service", serviceParams, serviceOptions);
      
      elService.addEventListener('getService', e => {
        loading(false);
        resolve(e.detail)
      });
    
      loading(true)
      service.mount('service');
    });
  })
}
