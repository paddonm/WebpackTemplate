import { OnSchedTemplates } from "../OnSchedTemplates";
import { OnSchedHelpers }   from "../utils/OnSchedHelpers";
import googleIcon           from '../assets/img/google.png';
import outlookIcon          from '../assets/img/outlook.png';


export const resourcesList = response => {
  const tmplResources = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-list">
                      <div class="onsched-table">
                          ${response.data.map((resource, index) =>
                              `<div class="row">
                                  <div class="icon-col">
                                  ${ resource.imageUrl == undefined || resource.imageUrl.length == 0 ?
                                      OnSchedTemplates.circleIcon(resource.name) : OnSchedTemplates.listImage(resource.imageUrl)
                                  }
                                  </div>
                                  <div class="info-col">
                                      <a href="#" class="list-item name" data-id=${resource.id} data-element="resources" 
                                          title="Click to book this service">
                                          ${resource.name}
                                      </a>
                                      <div class="list-item-description">${resource.description}</div>
                                  </div>
                               </div>`
      ).join("")}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
  return tmplResources;
}

export const resourceSetup = (element, data, customFieldsArray) => {

  const tmplResourceSetup = `
  <div class="onsched-container">
  <form class="onsched-wizard onsched-form" name="resourceSetup">
      <input type="hidden" name="step" value="0" />
      ${OnSchedTemplates.wizardTitle("Resource Setup", data)}

      ${resourceSetupGeneralInformation(element, data)}

      ${resourceSetupContactInformation(element, data)}

      ${resourceSetupAddress(element, data)}

      ${resourceSetupCustomFields(customFieldsArray)}
      
      ${resourceSetupAvailability(element, data)}

      ${resourceSetupCalendarSync(element, data)}

      <div class="onsched-wizard-nav">
          <div style="display:table-row">
              <div class="onsched-wizard-nav-status">
                  <!-- Circles which indicates the steps of the form: -->
              </div>
              <div class="onsched-wizard-nav-buttons">
                  <button type="button" id="prevButton" class="prevButton">Previous</button>
                  <button type="submit" id="nextButton" class="nextButton">Next</button>
              </div>
          </div>
      </div>
  </form>
</div>        
  `;

  return tmplResourceSetup;
}

const resourceSetupGeneralInformation = (element, data) => {
  const markup = `
  <div class="onsched-wizard-section">
  <h2>General Information</h2>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="resourceName">Resource Name</label>
          <input id="resourceName" type="text" name="name" value="${OnSchedHelpers.DataValue(data.name)}" required="required" data-post="root"/>
      </div>
      <div class="onsched-form-col">
          <label for="resourceTimezone">Timezone</label>
          <select id="resourceTimezone" class="onsched-select" name="timezoneName" value="${OnSchedHelpers.DataValue(data.timezoneName)}" data-post="root">
              ${OnSchedTemplates.TimezoneSelectOptions(OnSchedTemplates.Timezones(), true)}
          </select>
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" value="${OnSchedHelpers.DataValue(data.email)}" data-post="root"/>
      </div>
      <div class="onsched-form-col">
          <label for="groupId">Group</label>
          <select id="groupId" name="groupId"  value="${OnSchedHelpers.DataValue(data.groupId)}" class="onsched-select" data-post="root"></select>
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="3" placeholder="Enter Resource Description" data-post="root">${OnSchedHelpers.DataValue(data.description)}
      </textarea>                    
      </div>
  </div>
   <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label>Image preview</label>
          ${OnSchedTemplates.previewImage(data)}
      </div>
      <div class="onsched-form-col">
          <label>Upload Image</label>
          <div>
              <input type="file" accept="image/*" id="onsched-system-file-upload" name="onsched-system-file-upload" hidden="hidden">
              <button type="button" class="onsched-file-upload-btn">Choose a file</button>
              <span id="onsched-file-upload-txt" class="onsched-file-upload-txt">No file chosen yet.</span>
          </div>
      </div>                    
  </div>               
</div>
  `;
  return markup;
}

const resourceSetupContactInformation = (element, data) => {
  const markup = `
<div class="onsched-wizard-section">
  <h2>Contact Information</h2>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="businessPhone">Business Phone</label>
          <input type="tel" id="businessPhone" name="businessPhone"
              value="${OnSchedHelpers.DataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.businessPhone))}" data-post="contact"/>
      </div>
      <div class="onsched-form-col">
          <label for=""mobilePhone>Mobile Phone</label>
          <input type="tel" id="mobilePhone" name="mobilePhone" 
              value="${OnSchedHelpers.DataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.mobilePhone))}" data-post="contact" />
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="homePhone">Home Phone</label>
          <input type="tel" id="homePhone" name="homePhone" 
              value="${OnSchedHelpers.DataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.homePhone))}" data-post="contact" />
      </div> 
      <div class="onsched-form-col">
          <label for="preferredPhoneType">Preferred Contact Phone</label>
          <select class="form-control" id="preferredPhoneType" name="preferredPhoneType" value="${OnSchedHelpers.DataValue(data.contact.preferredPhoneType)}" data-post="contact">
              <option value="B" selected="selected">Business</option>
              <option value="M" selected="selected">Mobile</option>
              <option value="H">Home</option>
          </select>
      </div>                                     
  </div>      
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="notificationType">Notification Type</label>
          <select class="onsched-select" id="notificationType" name="notificationType" value="${OnSchedHelpers.DataValue(data.notificationType)}" aria-required="true" aria-invalid="false" data-post="root">
              <option value="0"></option>
              <option value="1" selected="selected">Email</option><option value="2">SMS</option>
              <option value="3">Email and SMS</option>
          </select>
      </div>
      <div class="onsched-form-col">
          <label for="bookingNotification">Booking Notifications</label>
          <select class="form-control" id="bookingNotification" name="bookingNotification" value="${OnSchedHelpers.DataValue(data.bookingNotifications)}" aria-required="true" aria-invalid="false" data-post="root">
              <option value="0">None</option>
              <option value="1" selected="selected">Online Bookings</option>
              <option value="2">All Bookings &amp; Reminders</option>
          </select>
      </div>
  </div>                          
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="">Skype Username</label>
          <input type="text" id="skypeUsername" name="skypeUsername" value="${OnSchedHelpers.DataValue(data.contact.skypeUsername)}"  data-post="contact"/>
      </div>
      <div class="onsched-form-col">
      </div>
  </div>
</div>
  `;
  return markup;
}

const resourceSetupAddress = (element, data) => {
  const markup = `
<div class="onsched-wizard-section">
  <h2>Address</h2>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="addressLine1">Address Line 1</label>
          <input id="addressLine1" type="text" name="addressLine1" value="${OnSchedHelpers.DataValue(data.address.addressLine1)}" data-post="address"/>
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="addressLine2">Address Line 2</label>
          <input id="addressLine2" type="text" name="addressLine2" value="${OnSchedHelpers.DataValue(data.address.addressLine2)}" data-post="address" />
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="city">City</label>
          <input id="city" type="text" name="city" value="${OnSchedHelpers.DataValue(data.address.city)}" data-post="address"/>
      </div>
      <div class="onsched-form-col">
          <label for="state">State / Province</label>
          <select id="state" name="state" value="${OnSchedHelpers.DataValue(data.address.state)}" class="onsched-select" data-post="address"></select>
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <label for="country">Country</label>
          <select id="country" name="country" value="${OnSchedHelpers.DataValue(data.address.country)}" class="onsched-select" data-post="address">
              <option></option>
              <option value="CA">Canada</option>
              <option value="US">United States</option>
          </select>
      </div>
      <div class="onsched-form-col">
          <label for="postalCode">Zip / Postal Code</label>
          <input id="postalCode" type="text" name="postalCode" value="${OnSchedHelpers.DataValue(data.address.postalCode)}" data-post="address" />
      </div>
  </div>
</div>
  `;
  return markup;
}

const resourceSetupAvailability = (element, data) => {
  const markup = `
<div class="onsched-wizard-section">
  <h2>Availability</h2>
  <h4 class="onsched-business-hours-tz">Eastern Timezone</h4>
  <div class="onsched-business-hours">${OnSchedTemplates.businessHoursTable(element.onsched.locale, data.availability)}</div>
</div>

  `;
  return markup;
}

const resourceSetupCalendarSync = (element, data) => {
  const markup = `
<div class="onsched-wizard-section">
  <h2>Outlook / Google Calendar Sync</h2>
  <div class="onsched-form-row">
      <div class="onsched-form-col" style="width:60px">
          <img id="outlook-icon" src="${outlookIcon}" width="30" height="30"/>
      </div>
      <div class="onsched-form-col">
          <label>Outlook email address</label>
          <input type="text" id="outlook-email" name="outlookCalendarId" />
          <input type="button" name="outlookAuthButton" value="Authorize" />
      </div>
  </div>
  <div class="onsched-form-row">
      <div class="onsched-form-col">
          <img id="google-icon" src="${googleIcon}" width="30" height="30"/>
      </div>
      <div class="onsched-form-col">
          <label>Google email address</label>
          <input type="text" id="google-email" name="googleCalendarId" />
          <input type="button" name="googleAuthButton" value="Authorize"/>
      </div>
  </div>
</div>
  `;
  return markup;
}

const resourceSetupCustomFields = customFields => {
  var markup = ``;
  if (customFields && customFields.length) {
      markup = `
                  <div class="onsched-wizard-section">
                      <h2>Custom Fields</h2>

                          ${customFields && customFields.map((field, i) => {
                              let newRow = !(i % 2)

                              return (
                                  `
                                  ${newRow ? '<div class="onsched-form-row">' : ''}
                                                  <div class="onsched-form-col">
                                                      <label for="customField${i}">
                                                          ${OnSchedHelpers.DataValue(field.label)}
                                                      </label>
                                                      <input type="text" id="customField${i}" name="field${i}" 
                                                          value="${OnSchedHelpers.DataValue(field.value)}" 
                                                          data-post="customFields" />
                                                  </div>
                                  ${newRow ? '</div>' : ''}
                                  `
                              )
                          })}                                  
                  </div>
              `
  }
  return markup;
}   
