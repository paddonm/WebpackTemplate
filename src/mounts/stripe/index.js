import { addElementToRoot, 
         removeElementFromRoot }    from "../../utils/RootHelpers";
import { serviceMount }             from "../services";
import { formatPhoneInput }         from "../../utils/FormatHelpers"
import { stripePaymentTypeTemplate, 
         stripeProductTemplate }    from "../../templates/stripe";
import { availabilityMount } from "../availability";


export const mountStripePayment = (appointment) => {
  const { locationId, serviceId, customerId } = appointment;

  var stripe = Stripe('pk_test_TrpRcCP2CIUDXBlhvXq8h2Lm');
  
  var elements = stripe.elements();

  serviceMount({ locationId, serviceId })
  .then(service => {
    addElementToRoot('stripe-modal')
      .then(elProductModal => { 
        // var availabilityParams  = { locationId, serviceId, customerId, completeBooking: 'RS', date: new Date(appointment.date) };
        // var availabilityOptions = { groupSize: true };
        // // Re-check availabilty
        // availabilityMount(availabilityParams, availabilityOptions);
  
        elProductModal.innerHTML = stripeProductTemplate(service)
        function openModal() {
          document.getElementById("backdrop").style.display = "block"
          document.getElementById("exampleModal").style.display = "block"
          document.getElementById("exampleModal").className += "show"
        }
        function closeModal() {
            document.getElementById("backdrop").style.display = "none"
            document.getElementById("exampleModal").style.display = "none"
            document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
        }
        // Get the modal
        var modal = document.getElementById('exampleModal');
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            closeModal();
            removeElementFromRoot('stripe-modal');

            const { locationId, serviceId, customerId } = appointment;

            let availabilityParams = { locationId, serviceId, customerId, completeBooking: 'RS' };
            let availabilityOptions = { groupSize: true };

            availabilityMount(availabilityParams, availabilityOptions);
          }
        }
        
        openModal();

        document.getElementById('checkout-button').onclick = () => {
          var modalContent = document.getElementById('onsched-appointment-modal');
          modalContent.innerHTML = stripePaymentTypeTemplate(service);
          formatPhoneInput('format-phone-number');

          var style = {
            base: {
              color: '#fff',
              fontSize: '16px',
              fontFamily: '"Open Sans", sans-serif',
              fontSmoothing: 'antialiased',
              '::placeholder': {
                color: '#c4d1e8',
              },
            },
            invalid: {
              color: '#e5424d',
              opacity: '.7',
              color: '#ff878f',
              ':focus': {
                color: '#c4d1e8',
              },
            },
          };

          var card = elements.create("card", { style: style });
          card.mount("#card-element");
        }
      })
  });
  
  console.log('mounts > stripe', appointment, stripe)
}
