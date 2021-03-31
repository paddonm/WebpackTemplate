import { OnSchedTemplates } from '../OnSchedTemplates';
import { OnSchedHelpers } from '../utils/OnSchedHelpers';


export const locationsList = response => {
  const tmplLocations = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-list">
                      <div class="onsched-table">
                          ${response.data.map((location, index) =>
                              `<div class="row">
                                  <div class="icon-col">
                                      ${ location.imageUrl == undefined || location.imageUrl.length == 0 ?
                                          OnSchedTemplates.circleIcon(location.name) : OnSchedTemplates.listImage(location.imageUrl)
                                      }
                                  </div>
                                  <div class="info-col">
                                      <a href="#" class="list-item name" data-id=${location.id} data-element="locations" 
                                          title="Click to book at this location">${location.name}
                                      </a>
                                      <div class="list-item-description">${location.address.addressLine1}</div>
                                      <div class="list-item-distance">
                                          ${location.travel != null && location.travel.distance != null ?
              location.travel.distance : ""}
                                      </div>
                                  </div>
                               </div>`
      ).join("")}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
  return tmplLocations;
}

export const locationSetup = (element, data) => {
        const tmplLocationSetup = `
        <div class="onsched-container">
        <form class="onsched-wizard onsched-form" name="locationSetup">
            <input type="hidden" name="step" value="0" />
            ${OnSchedTemplates.wizardTitle("Location Setup", data)}

            ${
                locationSetupGeneralInformation(element, data)
            }
            ${
                locationSetupBusinessAddress(element, data)
            }
            ${
                locationSetupBusinessHours(element, data)
            }

            <div class="onsched-wizard-nav">
                <div style="display:table-row">
                    <div class="onsched-wizard-nav-status">
                        <!-- Circles which indicates the steps of the form: -->
                    </div>
                    <div style="display:table-cell">
                        <div class="onsched-progress-container">
                        <div class="onsched-progress">
                            <div class="indeterminate"></div>
                            </div>
                        </div>
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

        return tmplLocationSetup;

    }
const locationSetupGeneralInformation = (element, data) => {
  const markup = `
    <div class="onsched-wizard-section">
      <h2>General Information</h2>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="businessName">Business Name</label>
          <input id="businessName" type="text" name="name" value="${OnSchedHelpers.DataValue(data.name)}" required="required" data-post="root"/>
        </div>
        <div class="onsched-form-col">
          <label for="businessTimezone">Timezone</label>
          <select id="businessTimezone" class="onsched-select" name="timezoneName" value="${OnSchedHelpers.DataValue(data.timezoneName)}" data-post="root">
              ${OnSchedTemplates.TimezoneSelectOptions(OnSchedTemplates.Timezones())}
          </select>
        </div>
      </div>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="businessEmail">Email</label>
          <input id="businessEmail" type="email" name="email" value="${OnSchedHelpers.DataValue(data.email)}" data-post="root" />
        </div>
        <div class="onsched-form-col">
          <label for="businessWebsite">Website</label>
          <input id="businessWebsite" type="text" name="website" value="${OnSchedHelpers.DataValue(data.website)}" data-post="root" />
        </div>
      </div>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="businessPhone">Phone</label>
          <input id="businessPhone" type="tel" name="phone" value="${OnSchedHelpers.DataValue(OnSchedHelpers.FormatPhoneNumber(data.phone))}" data-post="root" />
        </div>
        <div class="onsched-form-col">
          <label for="businessFax">Fax</label>
          <input id="businessFax" type="tel" name="fax" value="${OnSchedHelpers.DataValue(OnSchedHelpers.FormatPhoneNumber(data.fax))}" data-post="root" />
        </div>
      </div>
    </div>        
  `;

  return markup;
}

const locationSetupBusinessAddress = (element, data) => {
  const markup = `
  <div class="onsched-wizard-section">
    <h2>Business Address</h2>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="addressLine1">Address Line 1</label>
          <input id="addressLine1" type="text" name="addressLine1" value="${OnSchedHelpers.DataValue(data.address.addressLine1)}" data-post="address"/>
        </div>
      </div>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="addressLine2">Address Line 2</label>
          <input id="addressLine2" type="text" name="addressLine2" value="${OnSchedHelpers.DataValue(data.address.addressLine1)}"  data-post="address"/>
        </div>
      </div>
      <div class="onsched-form-row">
        <div class="onsched-form-col">
          <label for="city">City</label>
          <input id="city" type="text" name="city" value="${OnSchedHelpers.DataValue(data.address.city)}"  data-post="address" data-post="address"/>
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
          <input id="postalCode" type="text" name="postalCode" value="${OnSchedHelpers.DataValue(data.address.postalCode)}" data-post="address"/>
        </div>
      </div>
    </div>
  `;

  return markup;
}

const locationSetupBusinessHours = (element, data) => {
  const markup = `
    <div class="onsched-wizard-section">
      <h2>Business Hours</h2>
      <h4 class="onsched-business-hours-tz"></h4>
      <div class="onsched-business-hours">${OnSchedTemplates.businessHoursTable(element.onsched.locale, data.businessHours)}</div>
    </div>        
  `;

  return markup;
}   

export const searchForm = params => {
  const tmplSearchForm = `
    <div class="onsched-container">
      <div class="onsched-row">
        <div class="onsched-col">
          <form class="onsched-search-form" method="get">
            <div class="onsched-search-wrapper">
              <input name="searchText" value="${params.searchText}" size="50" type="text" placeholder="${params.placeholder}" />
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
  return tmplSearchForm;
}

const businessHoursDayCell = (dayOfWeek, locale) => {
    var date = new Date(dayOfWeek);
    const markup = `
        <div class="onsched-business-hours-day ${date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase()}">
            <div class="onsched-dropdown">
                <button class="onsched-dropdown-menu-button" title="Click for options">
                    ${date.toLocaleDateString(locale, { weekday: 'long' })}
                    <span class="caret"></span>
                </button>
                <ul class="onsched-dropdown-menu" style="display: none;">
                    <li><a href="#" name="open" class="onsched-dropdown-menu-item">Available</a></li>
                    <li><a href="#" name="closed" class="onsched-dropdown-menu-item">Unavailable</a></li>
                    <li><a href="#" name="24hrs" class="onsched-dropdown-menu-item">24 Hours</a></li>
                </ul>
            </div>
        </div>
    `;
    return markup;
}

const businessHoursTimeCell = (dayOfWeek, locale, startTimeIndicator, data) => {
    var date = new Date(dayOfWeek);
    var weekDay = date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase();
    // need to detect open, closed, 24hrs here and template accordingly
    // data[weekDay].startTime
    // closed = startTime=0 and endTime=0
    // 24 hours = startTime=0 and endTime=2400

    var name = startTimeIndicator ? weekDay + "StartTime" : weekDay + "EndTime";
    const markup = `
        <div class="onsched-business-hours-time ${date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase()}">
            <label class="closed" style="display:${data[weekDay].startTime == 0 && data[weekDay].endTime == 0 ? "block" : "none"}">Closed</label>
            <label class="hrs24"  style="display:${data[weekDay].startTime == 0 && data[weekDay].endTime == 2400 ? "block" : "none"}">24 Hours</label>
            <select class="time" name="${name}" style="${showHideTimeSelect(weekDay, data)}" data-post="businessHours">
                ${OnSchedTemplates.initTimesSelectOptions(OnSchedTemplates.initTimesSelectData(locale), weekDay, startTimeIndicator, data)}
            </select>
        </div>
    `;
    return markup;
}

const showHideTimeSelect = (weekDay, data) => {
    var closed = data[weekDay].startTime == 0 && data[weekDay].endTime == 0;
    var hrs24 = data[weekDay].startTime == 0 && data[weekDay].endTime == 2400;
    var showSelect = (closed == false && hrs24 == false) ? true : false;
//        console.log("ShowHideTimeSelect " + weekDay + "-", showSelect);
    if (showSelect)
        return "display:block";
    else
        return "display:none";
}

export const businessHoursTable = (locale, data) => {
  var daysOfWeek = [];
  var dtSun = new Date(1960, 10 - 1, 30, 0, 0, 0, 0);
  var dtSat = new Date(dtSun);
  dtSat.setDate(dtSun.getDate() + 6);

  for (var date = new Date(dtSun); date <= dtSat; date.setDate(date.getDate() + 1)) {
      daysOfWeek.push([new Date(date)]);
  }

  const markup = `
      <div class="onsched-business-hours-row">
          <div class="onsched-business-hours-day"></div>
          ${daysOfWeek.map((dayOfWeek, index) =>
              `${businessHoursDayCell(dayOfWeek, locale)}`
          ).join("")}
      </div>
      <div class="onsched-business-hours-row start">
          <div class="onsched-business-hours-time">
              <label>Start</label>
          </div>
          ${daysOfWeek.map((dayOfWeek, index) =>
              `${businessHoursTimeCell(dayOfWeek, locale, true, data)}`
          ).join("")}
      </div>
      <div class="onsched-business-hours-row end">
          <div class="onsched-business-hours-time">
              <label>End</label>
          </div>
          ${daysOfWeek.map((dayOfWeek, index) =>
              `${businessHoursTimeCell(dayOfWeek, locale, false, data)}`
          ).join("")}
      </div>
  `;
  return markup;
}
