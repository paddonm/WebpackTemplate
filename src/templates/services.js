import { OnSchedTemplates } from "../OnSchedTemplates";
import { OnSchedHelpers }   from "../utils/OnSchedHelpers";


export const servicesList = response => {
  const tmplServices = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-list">
                      <div class="onsched-table">
                          ${response.data.map((service, index) =>
                              `<div class="row">
                                  <div class="icon-col">
                                  ${ service.imageUrl == undefined || service.imageUrl.length == 0 ?
                                      OnSchedTemplates.circleIcon(service.name) : OnSchedTemplates.listImage(service.imageUrl)
                                  }
                                  </div>
                                  <div class="info-col">
                                      <a href="#" class="list-item name" data-id=${service.id} data-element="services" 
                                          title="Click to book this service">${service.name}
                                      </a>
                                      <div class="list-item-description">${service.description}</div>
                                  </div>
                               </div>`
      ).join("")}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
  return tmplServices;
}

export const serviceSetup = (element, data) => {

  const tmplServiceSetup = `
  <div class="onsched-container">
  <form class="onsched-wizard onsched-form" name="serviceSetup">
      <input type="hidden" name="step" value="0" />
      <h1>Service Setup</h1>

      ${
          serviceSetupGeneralInformation(element, data)
      }
      ${serviceSetupSettings(element, data)}
      ${serviceSetupAvailability(element, data)}           

      <div class="onsched-wizard-nav">
          <div style="display:table-row">
              <div class="onsched-wizard-nav-status">
                  <!-- Circles which indicates the steps of the form: -->
                  <span class="step active"></span>
                  <span class="step"></span>
                  <span class="step"></span>
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

  return tmplServiceSetup;
}

const selectedOption = (value, selected) => {
    if (value == selected)
        return "selected=\"selected\"";
    else
        return "";
}

export const timeIntervals = (locale, interval, selected) => {
  var intervalData = [];
  var dtSun = OnSchedHelpers.SundayDate();
  var dtNext = new Date(dtSun);
  dtNext.setDate(dtSun.getDate() + 1);

  for (var date = new Date(dtSun); date < dtNext; date.setMinutes(date.getMinutes() + interval)) {
      if (date.getHours() == 0 && date.getMinutes() == 0)
          continue;
      var timeInterval = {};
      timeInterval.value = date.getHours()*60 + date.getMinutes();
      var hours = date.getHours() + ":";
      var mins = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }).substr(3,2);
      if (date.getHours() == 0 || (date.getHours() == 1 && date.getMinutes() <= 30)) 
          timeInterval.name  = date.getHours()*60+date.getMinutes() + " min";
      else
          timeInterval.name = hours+mins+ " hrs";        
      intervalData.push(timeInterval);
  }

  const markup = `
  ${intervalData.map((interval, index) =>
  `
      <option value="${interval.value}" ${selectedOption(interval.value, selected)}>${interval.name}</option>
      `
  ).join("")}
  `;

  return markup;
}

function serviceSetupGeneralInformation(element, data) {
    const markup = `
<div class="onsched-wizard-section">
    <h2>General Information</h2>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="serviceName">Service Name</label>
            <input id="serviceName" type="text" name="name"  value="${OnSchedHelpers.DataValue(data.name)}" required="required" data-post="root" />
        </div>
        <div class="onsched-form-col">
            <label for="serviceType">Service Type</label>
            <select id="serviceType" class="onsched-select" name="type" value="${OnSchedHelpers.DataValue(data.type)}" data-post="root">
                <option value="1"/>Appointment</option>
                <option value="2"/>Event</option>
                <option value="3"/>Meeting</option>
                <option value="4"/>Class</option>
            </select>
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="duration">Duration</label>
            <select id="duration" class="onsched-select" name="duration" value="${OnSchedHelpers.DataValue(data.duration)}" data-post="root">
                ${timeIntervals("en-US", 5, data.duration)}
            </select>                       
        </div>
        <div class="onsched-form-col">
            <label for="serviceGroupId">Group</label>
            <select id="serviceGroupId" class="onsched-select" name="serviceGroupId" value="${OnSchedHelpers.DataValue(data.serviceGroupId)}" data-post="root">
            </select>     
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="3" placeholder="Enter Service Description" data-post="root" required="requited">${OnSchedHelpers.DataValue(data.description)}</textarea>                    
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
</div>        `;
    return markup;
}
function serviceSetupSettings(element, data) {
    const markup = `
<div class="onsched-wizard-section">
    <h2>Service Settings</h2>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label>Booking Limit (0 or blank to defaults to calendar bookings per slot)</label>
            <input type="number" id="bookingLimit" name="bookingLimit" min="0" max="500" value="${OnSchedHelpers.DataValue(data.bookingLimit)}" data-post="root" data-type="int">
        </div>
        <div class="onsched-form-col">
            <label for="bookingInterval">Booking Interval</label>
            <select id="bookingInterval" name="bookingInterval" value="${OnSchedHelpers.DataValue(data.bookingInterval)}" data-post="root">
                ${timeIntervals("en-US", 5, 30)}
            </select>
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="bookAheadUnit">Book Ahead Unit</label>
            <select id="bookAheadUnit" name="bookAheadUnit" value="${OnSchedHelpers.DataValue(data.bookAheadUnit)}" data-post="settings">
                <option value="0">Use the online booking setting</option>
                <option value="1">Days</option>
                <option value="2">Weeks</option>
                <option value="3">Months</option>
            </select>
        </div>
        <div class="onsched-form-col">
            <label for="bookAheadValue">Book Ahead Value</label>
            <select id="bookAheadValue" name="bookAheadValue" value="${OnSchedHelpers.DataValue(data.bookAheadValue)}" data-post="settings">
                <option value="0">Use the online booking setting</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
            </select>
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="bookInAdvance">Book In Advance</label>
            <select id="bookInAdvance" name="bookInAdvance" value="${OnSchedHelpers.DataValue(data.bookInAdvance)}" data-post="settings">
                ${timeIntervals("en-US", 30, 30)}
            </select>
        </div>
        <div class="onsched-form-col">
            <label for="roundRobin">Round Robin</label>
            <select id="roundRobin" name="roundRobin" value="${OnSchedHelpers.DataValue(data.roundRobin)}" data-post="root">
                <option value="0">None</option>
                <option value="1">Random</option>
                <option value="2">Balanced</option>
            </select>
        </div>
    </div>
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="durationSelect">
                <input id="durationSelect" type="checkbox" name="durationSelect" ${OnSchedHelpers.CheckboxChecked(OnSchedHelpers.DataValue(data.durationSelect))} data-post="options" data-type="bool"/>
                Duration Selection
            </label>
            <label style="margin-bottom:16px">
                (Choose this option if you want variable durations e.g.30,60,or 90 mins)
            </label>
        </div>
        <div class="onsched-form-col minmaxinterval">
            <label for="durationMin">Duration Min / Max / Interval</label>
            <div>
                <select id="durationMin" class="onsched-select" name="durationMin" value="${OnSchedHelpers.DataValue(data.durationMin)}" data-post="options">
                    ${timeIntervals("en-US", 5, 30)}
                </select>                                   
                <select id="durationMax" class="onsched-select" name="durationMax" value="${OnSchedHelpers.DataValue(data.durationMax)}" data-post="options">
                    ${timeIntervals("en-US", 5, 90)}
                </select> 
                <select id="durationInterval" class="onsched-select" name="durationInterval" value="${OnSchedHelpers.DataValue(data.durationInterval)}" data-post="options">
                    ${timeIntervals("en-US", 5, 30)}
                </select>
            </div>                        
        </div>
    </div> 
    <div class="onsched-form-row">
        <div class="onsched-form-col">
            <label for="public">
                <input id="public" type="checkbox" name="public" ${OnSchedHelpers.CheckboxChecked(OnSchedHelpers.DataValue(data.showOnline))} data-post="root" data-type="bool" />
                Consumer booking enabled
            </label>
        </div>
        <div class="onsched-form-col">
            <label for="defaultService">
                <input id="defaultService" type="checkbox" name="defaultService" ${OnSchedHelpers.CheckboxChecked(OnSchedHelpers.DataValue(data.defaultService))} data-post="options" data-type="bool" />
                Use as the default service
            </label>
        </div>
    </div>               
</div>        `;
    return markup;
}
function serviceSetupAvailability(element, data) {
    const markup = `
<div class="onsched-wizard-section">
    <h2>Availability</h2>
    <h4 class="onsched-business-hours-tz">Eastern Timezone</h4>
    <div class="onsched-business-hours">${OnSchedTemplates.businessHoursTable(element.onsched.locale, data.availability)}</div>
</div>        `;
    return markup;
}   
