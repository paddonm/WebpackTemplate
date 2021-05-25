export const stripeProductTemplate = (service) => `
  <div class="modal fade" 
    id="exampleModal" 
    tabindex="-1" 
    role="dialog" 
    aria-labelledby="exampleModalLabel" 
    aria-hidden="true" 
    data-show="true" 
    data-focus="true"
  >
    <div class="modal-dialog" role="document">
      <div id="onsched-appointment-modal" class="modal-content">
        <div class="stripe-product-card">
          <div class="stripe-product-description">
            <img
              src="${service.imageUrl}"
              alt=""
            />
  
            <div>
              <h3>${service.name}</h3>
            
              <h5>
                ${(service.feeAmount).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </h5>
            </div>
          </div>
  
        </div>
        
        <button type="button" id="checkout-button">Checkout</button>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" id="backdrop"  style="display: none;"></div>
`

export const stripePaymentTypeTemplate = service => `
  <form id="stripe-payment-form">
    <h5>Enter the following information to booked your ${service.name}:</h5>

    <div class="stripe-payment-form-details">
      <div class="input-detail">
        <label for="name">Name</label>
        <input type="text" name="name" placeholder="Jenny Booker" />
      </div>
      
      <div class="input-detail">
        <label for="email">Email</label>
        <input type="text" name="email" placeholder="jenny@email.com" />
      </div>
      
      <div class="input-detail">
        <label for="phone">Phone</label>
        <input id="format-phone-number" type="tel" name="phone" placeholder="(947) 867-5309" />
      </div>
    </div>

    <div class="stripe-payment-form-card">
      <div id="card-element"></div>
    </div>
            
    <button id="submit-payment">Pay 
      ${(service.feeAmount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })}
    </button>
  </form>
`
