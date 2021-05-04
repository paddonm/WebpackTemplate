import moment from 'moment'
import { OnSchedTemplates } from '../OnSchedTemplates'
import { OnSchedHelpers }   from '../utils/OnSchedHelpers'


export const appointmentsList = response => {
  const statusTypes = [
      { resp: 'BK', friendly: 'Booked' },
      { resp: 'RS', friendly: 'Reserved' },
      { resp: 'CN', friendly: 'Cancelled' },
      { resp: 'RE', friendly: 'Rescheduled' },
      { resp: 'NS', friendly: 'No show' },
      { resp: 'IN', friendly: 'Initial' },
  ]
  
  const tmplAppointments = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-list">
                      <table class="onsched-table">
                          <tr>
                              <th>Resource</th>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>Appointment</th>
                              <th>Status</th>
                          </tr>
                          ${response.data.map((appointment, index) =>        
                              `<tr key="${index}" data-appointmentId="${appointment.id}" class="list-item name">
                                  <td>
                                      ${appointment.resourceName}
                                  </td>
                                  <td>
                                      ${appointment.name}
                                  </td>
                                  <td>
                                      ${appointment.phone}
                                  </td>
                                  <td>
                                      ${appointment.email}
                                  </td>
                                  <td>
                                      ${appointment.serviceName} ${moment(appointment.startDateTime).format('llll')}
                                  </td>
                                  <td>
                                      ${statusTypes.filter(status => status.resp === appointment.status)[0].friendly}
                                  </td>
                               </tr>`
                          ).join("")}
                      </table>
                  </div>
              </div>
          </div>
          <div id="appointments-modal"></div>
      </div>
  `;
  return tmplAppointments;
}

export const appointmentSearchForm = params => {
  let resources = params.resources ? params.resources : [];

  const filters = [
      {
          name: 'Status',
          paramName: 'status',
          component: 'select',
          type: 'select',
          options: [
              {label: 'Booked', value: 'BK'}, 
              {label: 'Cancelled', value: 'CN'}, 
              {label: 'Reserved', value: 'RS'}, 
              {label: 'Rescheduled', value: 'RE' }, 
              {label: 'No show', value: 'NS'}, 
              {label: 'Initial', value: 'IN'}
          ]            
      },
      // {
      //     name: 'Calendar',
      //     paramName: 'status',
      //     component: 'select',
      //     type: 'select',
      //     options: params.calendars && [params.calendars.map(calendar => ({name: calendar.name, value: calendar.id}))]
      // },
      {
          name: 'Resource',
          paramName: 'resourceId',
          component: 'select',
          type: 'select',
          options: resources.map(resource => (
              { label: resource.name, value: resource.id }
          ))
      },
      {
          name: 'From',
          paramName: 'startDate',
          component: 'input',
          type: 'date',
      },
      {
          name: 'To',
          paramName: 'endDate',
          component: 'input',
          type: 'date',
      },
  ]
  
  const tmplAppointmentSearchForm = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <form class="onsched-search-form" method="get">
                      <div class="onsched-filter-form">
                          ${filters.map(filter => 
                              `
                                  <div class="onsched-filter-wrapper">
                                      <label for="${filter.name}">${filter.name}</label>
                                      <${filter.component} id="${filter.paramName}" name="searchFilter-${filter.name}" type="${filter.type}" ${filter.component === 'input' ? '/>' : 
                                      `
                                          >
                                              <option value="">Any ${filter.name}</option>
                                              ${filter.options && filter.options.map((option, i) => `
                                                  <option value="${option.value}" key="${i}">${option.label}</option>
                                              `)}
                                          </${filter.component}>
                                      `}
                                  </div>    
                              `
                          ).join("")}
                      </div>
                      <div class="onsched-search-wrapper">
                          <input name="searchText" value="${params.searchText}" size="50" type="text" placeholder="${params.placeholder ? params.placeholder : 'Search by lastname, email, or customer ID'}" />
                          <input type="submit" value=" " title="Click to search" />
                      </div>
                      <p>${params.message}</p>
                      <div>
                          <div class="onsched-progress-container" style=width:100%;height:8px;">
                              <div class="onsched-progress">
                                  <div class="indeterminate"></div>
                              </div>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  `;
  return tmplAppointmentSearchForm;
}

export const errorBox = params => {
  const tmplErrorBox = `
      <div class="onsched-alert error">
          <button class="close" data-dismiss="onsched-alert" aria-hidden="true">x</button>
          <h4>Application Error<span>${params.code}</span></h4>
          <p>${params.message}</p>
      </div>
  `;
  return tmplErrorBox;
}

const privacyFields = options => {
    if (options.privacyFields == null)
        return "";
    if (options.privacyFields.checkboxLabel == null)
        return privacyFieldsLinkOnly(options);
    if (options.privacyFields.formRows > 1)
        return privacyFieldsTwoRows(options);
    const tmplPrivacyFields = `
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="acceptPrivacyTerms"><input id="acceptPrivacyTerms" type="checkbox" required>${options.privacyFields.checkboxLabel}</label>
        </div>
        <div class="onsched-form-col">
            <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                ${options.privacyFields.linkText}
            </a>
        </div>
    </div>
    `;
    return tmplPrivacyFields;
}

const privacyFieldsTwoRows = options => {
    const tmplPrivacyFields = `
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="acceptPrivacyTerms"><input id="acceptPrivacyTerms" type="checkbox" required>${options.privacyFields.checkboxLabel}</label>
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                ${options.privacyFields.linkText}
            </a>
        </div>
    </div>
        `;
    return tmplPrivacyFields;        
}

const privacyFieldsLinkOnly = options => {
    if (options.privacyFields == null)
        return "";
    const tmplPrivacyFields = `
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                ${options.privacyFields.linkText}
            </a>
        </div>
    </div>
    `;
    return tmplPrivacyFields;
}    

// Create booking fields from POST appointment response
export const bookingFields = (data, type) => {
    const tmplBookingFields = `
    ${ data.map((item, index) =>
        bookingField(item, type)
        
    ).join("")}
    `;
    return tmplBookingFields;
}

// Prob need separate functions for input,select, checkbox etc
const bookingField = (data, type) => {

    const tmplBookingField = `
        <div class="onsched-form-row">
            <div class="onsched-form-col">
                ${data.fieldListItems.length > 0 ? OnSchedTemplates.selectField(data, type) : OnSchedTemplates.inputField(data, type)}
            </div>
        </div>
    `;
    return tmplBookingField;
}

const inputField = (data, type) => {
    const tmplInputField = `
        <label for="${data.fieldName}">${data.fieldLabel}</label>
        <input type="text" id="${data.fieldName}" name="${data.fieldName}" ${data.fieldRequired ? "required" : ""} ${sizeAttribute(data.fieldLength)} ${bookingFieldDataAttribute(type)} />
    `;
    return tmplInputField;
}

const sizeAttribute = (length) => {
    if (length > 0)
        return "maxlength="+length;
    else
        return "";
}

const bookingFieldDataAttribute = (type) => {
    if (type == "appointment" || type == "customer")
        return "data-bookingfield=" + '"'+type+'"';
    else
        return "";
}

export const bookingForm = (response, options, locale) => {
  var date = OnSchedHelpers.ParseDate(response.dateInternational);
  var bookingDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var bookingDate = date.toLocaleString(locale, bookingDateOptions);

  var tmplBookingForm;

  if (response.bookingForms && response.bookingForms.bookingForm) {
    var customTemplate = response.bookingForms.bookingForm

    // Set custom parameters (not in API response)
    response = OnSchedHelpers.CustomTemplateParameters(response);
    
    // Add param variable values
    Object.keys(OnSchedHelpers.TemplateParameters).map(param => {
        if (response[OnSchedHelpers.TemplateParameters[param]]) {
            customTemplate = customTemplate.replace(`{${param}}`, response[OnSchedHelpers.TemplateParameters[param]]);
        }
    })
    
    tmplBookingForm = customTemplate;
  }
  else {
    tmplBookingForm = `
        <div class="onsched-popup-shadow" data-animation="zoomInOut">
          <div class="onsched-popup">
              <header class="onsched-popup-header">
                  <i class="fa fa-clock" style="margin-right:8px;font-size:18px;color:#1a73e8;"></i>
                  <span class="booking-timer">2:00 mins</span>&nbsp;to complete booking
                  <a href="#" class="onsched-close-btn" title="Close" aria-label="close modal" data-close></a>
              </header>
              <section class="onsched-booking-summary">
                  <h4>${response.businessName}</h4>
                  <h5>${response.serviceName}</h5>
                  <h5>
                      ${OnSchedHelpers.FormatDuration(response.duration)}
                      - ${response.resourceName}
                  </h5>
                  <h5>
                      ${bookingDate} @ ${OnSchedHelpers.FormatTime(response.time)}
                  </h5>
              </section>
    
              <section class="onsched-popup-content">
                  <form class="onsched-form booking-form">
                      <input type="hidden" name="id" value="${response.id}" />
                      <div class="onsched-form-row">
                          <div class="onsched-form-col">
                              <label for="onsched-field-firstname">First Name</label>
                              <input id="onsched-field-firstname" type="text" name="firstname" autofocus placeholder="* required" required>
                          </div>
                          <div class="onsched-form-col">
                              <label for="onsched-field-lastname">Last Name</label>
                              <input id="onsched-field-lastname" type="text" name="lastname" placeholder="* required" required>
                          </div>
                      </div>
                      <div class="onsched-form-row">
                          <div class="onsched-form-col">
                              <label for="onsched-field-email">Email</label>
                              <input id="onsched-field-email" type="email" name="email" placeholder="Enter valid email address" required>
                          </div>
                          <div class="onsched-form-col">
                              <label for="onsched-field-phone">Phone</label>
                              <input id="onsched-field-phone" type="phone" name="phone" placeholder="Enter phone number (optional)">
                          </div>
                      </div>
                      <div class="onsched-form-privacy-fields">
                          ${privacyFields(options)}
                      </div>
                      <div class="onsched-form-booking-fields">
                          ${bookingFields(response.appointmentBookingFields, "appointment")}
                          ${bookingFields(response.customerBookingFields, "customer")}
                      </div>
                      <div class="onsched-form-row last">
                          <div class="onsched-form-col">
                              <label for="onsched-field-message">Customer Message</label>
                              <textarea id="onsched-field-message" name="customerMessage" cols="3" rows="4" placeholder="Send us a message (optional)"></textarea>
                          </div>
                      </div>
                      <div class="onsched-form-row">
                          <div class="onsched-form-col">
                              <button type="submit" class="btn-submit">Complete Booking</button>
                          </div>
                          <div class="onsched-form-col">
                              <button type="button" class="btn-cancel">Cancel</button>
                          </div>
                      </div>
                  </form>
              </section>
              <footer class="onsched-popup-footer" style="display:none;">
    
              </footer>
    
          </div>
        </div>
    `;
  }

  return tmplBookingForm;
}
