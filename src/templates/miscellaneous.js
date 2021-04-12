
export const resourceGroupOptions = groups => {
  const markup = `
      <option value="">None</option>
      ${groups.map((group, index) =>
          `
          <option value="${group.id}">${group.name}</option>
          `
      ).join("")}
  `;
  return markup;
}

const countryStateOptions = states => {
  const markup = `
      ${states.map((state, index) =>
          `
          <option value="${state.code}" data-country="${state.country}">${state.name}</option>
          `
      ).join("")}
  `;
  return markup;
}

function CountryObject(code, name) {
    this.country = code;
    this.countryName = name;
    this.states = [];
}

export const stateSelectOptions = states => {
  // First prep the response data into a 2d array by country

  var countryArr = [];
  var stateArr = [];
  var countryObject;
  // keep reading entries until the company changes, then save and continue

  var prevCountry = null;

  for (var i = 0; i < states.length; i++) {
      if (prevCountry == null) {
          prevCountry = states[i].country;
          countryObject = new CountryObject(states[i].country, states[i].countryName)
      }
      else
      if (prevCountry != states[i].country) {
          // add an entry to the country array entry with states
          countryObject.states = stateArr;
          countryArr.push(countryObject);
          // reset vars for new country
          countryObject = new CountryObject(states[i].country, states[i].countryName)
          prevCountry = states[i].country;
          stateArr = [];
      }

      // add an entry for the state
      stateArr.push(states[i]);
  }
  // now we process the last entry
  countryObject.states = stateArr;
  countryArr.push(countryObject);

  // Now just template the mapped data to populate the select options with optgroups

  const markup = `
      <option></option>
      ${countryArr.map((country, index) =>
          `
          <optGroup label="${country.countryName}" value="${country.country}">
          ${ countryStateOptions(country.states) }
          </optgroup>
          `
      ).join("")}
  `;

  return markup;
}

export const countrySelectOptions = states => {
  // First prep the response data into a 2d array by country
  var countryArr = [];

  var countryObject;
  // keep reading entries until the company changes, then save and continue

  var prevCountry = null;

  for (var i = 0; i < states.length; i++) {
      if (prevCountry == null) {
          prevCountry = states[i].country;
          countryObject = new CountryObject(states[i].country, states[i].countryName)
      }
      else
          if (prevCountry != states[i].country) {
              // add an entry to the country array entry with states
              countryArr.push(countryObject);
              // reset vars for new country
              countryObject = new CountryObject(states[i].country, states[i].countryName)
              prevCountry = states[i].country;
          }
  }
  // now we process the last entry
  countryArr.push(countryObject);

  // Now just template the mapped data to populate the select options with optgroups

  const markup = `
      <option></option>
      ${countryArr.map((country, index) =>
      `
          <option value="${country.country}">${country.countryName}</option>
          `
      ).join("")}
  `;

  return markup;
}

export const previewImage = data => {
  const placeholderIcon = 'https://onsched.com/assets/icons/image-placeholder.png';
  
  const markup = `
      <img id="onsched-image-preview" 
          src="${data.id == undefined || data.id.length == 0 || !data.imageUrl || data.imageUrl.length == 0 ? placeholderIcon : data.imageUrl}" 
          width="50" height="50" data-post="image" />
  `;

  return markup;
}

export const confirmation = (appointment, locale) => {
  var date = OnSchedHelpers.ParseDate(appointment.dateInternational);
  var options = {
      weekday: "short", year: "numeric", month: "short",
      day: "numeric"
  };  
  var formattedDate = date.toLocaleString(locale, options);
  const tmplConfirmation = `
      <div class="onsched-container onsched-confirmation-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-booking-confirmation">
                      <h4>${appointment.businessName}</h4>
                      <p>Your appointment has been confirmed ${appointment.name}. See details below.</p>
                      <p> </p>
                      <p>${formattedDate} @ ${OnSchedHelpers.FormatTime(appointment.time)}</p>
                      <p>${appointment.serviceName} ${OnSchedHelpers.FormatDuration(appointment.duration)} - ${appointment.resourceName}</p>
                      <p>Confirmation#: ${appointment.confirmationNumber}</p>
                      <p style="font-size:smaller">You will receive an email or sms booking confirmation shortly.</p>
                  </div>
              </div>
          </div>
      </div>
  `;
  return tmplConfirmation;
}

export const popupFormHeader = () => {
  const tmplPopupFormHeader = `
      <header class="onsched-popup-header">
          <i class="fa fa-clock" style="margin-right:8px;font-size:18px;color:#1a73e8;"></i>
          <span class="booking-timer">2:00 mins</span>&nbsp;to complete booking
          <a href="#" class="onsched-close-btn" title="Close" aria-label="close modal" data-close></a>
      </header>
  `;
  return tmplPopupFormHeader;
}

const sizeAttribute = length => {
    if (length > 0)
        return "maxlength="+length;
    else
        return "";
}

const bookingFieldDataAttribute = type => {
    if (type == "appointment" || type == "customer")
        return "data-bookingfield=" + '"'+type+'"';
    else
        return "";
}

export const selectField = (data, type) => {

  const tmplSelectField = `
  <label for="${data.fieldName}">${data.fieldLabel}</label>
  <select id="${data.fieldName}" name="${data.fieldName}" ${data.fieldRequired ? "required" : ""}  ${bookingFieldDataAttribute(type)}>

  ${ data.fieldListItems.map((item, index) =>
          `<option value="${item.value}">${item.name}</option>
          `
      ).join("")}
      </select>
  `;
  return tmplSelectField;
}

export const inputField = (data, type) => {
  const tmplInputField = `
      <label for="${data.fieldName}">${data.fieldLabel}</label>
      <input type="text" id="${data.fieldName}" name="${data.fieldName}" ${data.fieldRequired ? "required" : ""} ${sizeAttribute(data.fieldLength)} ${bookingFieldDataAttribute(type)} />
  `;
  return tmplInputField;
}

export const listImage = url=> {
    const tmplImage =  `
        <div class="onsched-image-icon">
            <img src="${url}" width="58" height="58" />
        </div>
    `;
    return tmplImage;
}

const getLettersForIcon = text => {
    if (text.length < 1)
        return "";
    var parts = text.split(" ");
    var firstPart = parts[0];
    var secondPart = parts.length > 1 ? parts[1] : "";
    secondPart = secondPart.length > 0 ? secondPart :
        firstPart.length > 1 ? firstPart[2] : "";
    var initials = secondPart.length > 0 ?
        firstPart[0] + secondPart[0] : firstPart[0];
    initials = initials.toUpperCase();
    return initials;
}

export const circleIcon = name => {
    const tmplCircleIcon =  `
        <div class="onsched-circle-icon">
            ${getLettersForIcon(name)}
        </div>
    `;
    return tmplCircleIcon;       
}

export const initTimesSelectOptions = (times, weekDay, startTimeIndicator, data) => {
    const markup = `
        ${times.map((time, index) =>
            `<option value="${time[0]}" ${getTimeSelectedAttr(weekDay, startTimeIndicator, time[0], data)}>${time[1]}</option>`
        ).join("")}           
    `;
    return markup;
}

export const initTimesSelectData = (locale) => {
    locale = locale === undefined ? "en-US" : locale;
    var startTime = new Date(1960, 10 - 1, 30, 0, 0, 0, 0);
    var endTime = new Date(1960, 10 - 1, 31, 0, 0, 0, 0);
    var militaryTime = 0;
    var timesData = [];
    for (var time = new Date(startTime); time <= endTime; time.setMinutes(time.getMinutes() + 30)) {
        militaryTime = time < endTime ? time.getHours() * 100 + time.getMinutes() : 2400;
        timesData.push([militaryTime, time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })]);
    }
    // can template this data
    return timesData;
}

export const getTimeSelectedAttr = (weekDay, startTimeIndicator, time, data) => {
    var dataTime = startTimeIndicator ? data[weekDay].startTime : data[weekDay].endTime;
    return dataTime == time ? "selected=\"selected\"" : "";
}
