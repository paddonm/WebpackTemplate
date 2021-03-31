import moment from 'moment'

import { OnSchedTemplates } from '../OnSchedTemplates';
import { OnSchedHelpers }   from '../utils/OnSchedHelpers';


export const availabilityContainer = () => {
  const markup = `
    <div class="onsched-container onsched-availability">
      <div class="onsched-error-container"></div>
      <div class="onsched-row">
          <div class="onsched-col">
              <div class="onsched-business-name" style="display:none">&nbsp;</div>
              <div class="onsched-available-times-header">
                  <div class="date-selected">
                      <div class="dow">Tue</div>
                      <div class="dom">24</div>
                  </div>
                  <div>
                      <div class="onsched-business-name" style="display:none">&nbsp;</div>
                      <div class="onsched-calendar-prompt" style="">Select a Date & Time</div>
                      <div class="onsched-service-name"></div>
                      <div class="onsched-service-duration">30 min</div>
                      <div class="onsched-service-description" style="display:none">General assessment of patient for Hypertension</div>
                  </div>
              </div>
              <div class="onsched-calendar"></div>
              <div class="onsched-timezone">
                  <select class="onsched-select timezone">
                      ${OnSchedTemplates.TimezoneSelectOptions(Timezones())}
                  </select>
              </div>
          </div>
          <div class="onsched-col">
              <div class="onsched-available-times"></div>
          </div>
      </div>
      <div class="onsched-booking-form-container"></div>
    </div>
    <div class="onsched-booking-confirmation-container"></div>
    `;
  return markup;
}

export const timesContainer = (availableTimes, locationId, customerId, locale) => {

  locationId = OnSchedHelpers.IsEmpty(locationId) ? "" : locationId;
  customerId = OnSchedHelpers.IsEmpty(customerId) ? "" : customerId;

  const timesHtml = `
    <div class="time-container">
      ${availableTimes.map((availableTime, index) =>
      `<a href="#" class="time onsched-chip hoverable"
          data-locationId="${locationId}"
          data-customerId="${customerId}"
          data-startDateTime="${availableTime.startDateTime}"
          data-endDateTime="${availableTime.endDateTime}"
          data-resourceId="${availableTime.resourceId}"
          data-date="${availableTime.date}"
          data-time="${availableTime.time}"
          data-duration="${availableTime.duration}"
          data-slots="${availableTime.availableBookings}"
          title="Click to book now. ${availableTime.availableBookings} remaining"
          >
          ${OnSchedHelpers.timeFromMilitaryTime(availableTime.time, locale)}
        </a>`
      ).join("")}
    </div>
  `;
  return timesHtml;
}

const DatesAreEqual = (date1, date2) => {
    var equal = false;
    if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate())
        equal = true;

    return equal;
}

export const weeklyDateSelector = date => {
  var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

  // Here I need the logic to build out the weekdays
  // First from the date passed in figure out the day of the week
  var selectedDate = new Date(date);
  var workingDate = new Date(date);
  var dow = date.getDay();
  var weekStartDate = OnSchedHelpers.AddDaysToDate(workingDate, -dow);
  var week = [];
  var weekDayDate = weekStartDate;
  for (i = 0; i < 7; i++) {
      weekDayDate = OnSchedHelpers.AddDaysToDate(weekStartDate, i);
      week.push(weekDayDate);
  }

  var dayOptions = { weekday: 'short' };

  const htmlWeekdaySelector = `
      <div class="onsched-weekday-selector">
          <table cellpadding="0" cellspacing="0" role="grid">
              <tbody>
                  <tr>
                  ${week.map((date, index) =>
          `<td aria-selected="true" data-day="${date.getDay()}" class="${DatesAreEqual(selectedDate, date) ? 'selected' : ''}">
                          <button data-day="${date.getDay()}" data-date="${date}" class="datepicker-day-button" class="waves-effect">
                              ${week[index].toLocaleDateString("en-US", dayOptions)}</button>
                      </td>`
      ).join("")}
                  </tr>
              </tbody>
          </table>
      </div>
  `;

  const htmlDatePicker = `
  <div class="onsched-datepicker-week">
      <div class="onsched-week-selector" role="heading" aria-live="assertive">
          <button class="week-prev" type="button" disabled="disabled" title="Previous week">
              <span class="chevron">&#10094;</span>
          </button>
          <div class="date-selected">${date.toLocaleDateString("en-US", options)}</div>
          <button class="week-next" type="button" title="Next week">
              <span class="chevron">&#10095;</span>
          </button>
      </div>
      ${htmlWeekdaySelector}
  </div>
  `;

  html = htmlDatePicker;

  return html;
}

export const availableTimes2 = (availability, selectedDate, customerId, locale) => {

  const htmlNoAvailableTimes = `
      <div class="onsched-no-available-times">
          <p>
              <i class="fa fa-info-circle" style="margin-right:4px;font-size:14px;color:#333;"></i>
              No times available on this date
          </p>
      </div>
  `;

  if (availability.availableTimes.length == 0)
      return htmlNoAvailableTimes;

  var locationId = availability.locationId;

  // bust up times into morning, afternoon and evening
  var morning = []; // < 1200
  var afternoon = []; // 1200 to 1800
  var evening = []; // > 1800 

  for (var i = 0; i < availability.availableTimes.length; i++) {
      if (availability.availableTimes[i].time < 1200)
          morning.push(availability.availableTimes[i]);
      if (availability.availableTimes[i].time >= 1200 && availability.availableTimes[i].time < 1800)
          afternoon.push(availability.availableTimes[i]);
      if (availability.availableTimes[i].time > 1800)
          evening.push(availability.availableTimes[i]);
  }

  // Display Table of Morning, Afternoon and Evening Times
  // NOTE - any one of these could be empty
  // HOW DO I TEMPLATE THIS?
  // Conditionally generate rows for morning, afternoon, and evening

  const htmlMorningRows = `
          <tr><th>Morning</th></tr>
          <tr><td>${timesContainer(morning, availability.locationId, customerId, locale)}</td></tr>
  `;
  const htmlAfternoonRows = `
          <tr><th>Afternoon</th></tr>
          <tr><td>${timesContainer(afternoon, availability.locationId, customerId, locale)}</td></tr>
  `;
  const htmlEveningRows = `
          <tr><th>Evening</th></tr>
          <tr><td>${timesContainer(evening, availability.locationId, customerId, locale)}</td></tr>
  `;

  const html = `
      <table class="onsched-table">
          ${morning.length > 0 ? htmlMorningRows : ''}
          ${afternoon.length > 0 ? htmlAfternoonRows : ''}
          ${evening.length > 0 ? htmlEveningRows : ''}
      </table>
  `;

  return html;
}

export const availableTimes = response => {

  const timesHtml = `
      <div class="onsched-time-container">
          ${response.availableTimes.map((availableTime, index) =>
          `<a href="#" class="time">
              <div class="onsched-chip hoverable">
                  ${timeFromDisplayTime(availableTime.displayTime)} <span class="ampm">${ampmFromDisplayTime(availableTime.displayTime)}</span>
              </div>
          </a>`
      ).join("")}
      </div>
  `;
  return timesHtml;
}

const getDisplayableWeeks = date => {
    var firstDay = OnSchedHelpers.FirstDayOfMonth(date);
    var lastDay = OnSchedHelpers.LastDayOfMonth(date);

    var dow = firstDay.getDay();
    var displayableMonthDaysWeekOne = 7 - dow;
    var remainingDisplayableDays = lastDay.getDate() - displayableMonthDaysWeekOne;
    var remainingDisplayableWeeks = Math.floor(remainingDisplayableDays / 7) + (remainingDisplayableDays % 7 > 0 ? 1 : 0);
    var totalDisplayableWeeks = remainingDisplayableWeeks + 1;
    return totalDisplayableWeeks;
}

const availableDaysFromDate = date => {
    // build array of availableDays using only a date
    // this can be built quickly before availability call completes

    // How many days to I need. Same as daysToPull calculation
    // Days to pull calculation now going to be all displayableDays
    var firstDate = getFirstDisplayableDate(date);
    var weeks = getDisplayableWeeks(date);
    var displayableDays = weeks * 7;
    //        var lastDate = AddDaysToDate(firstDate, displayableDays);
    // start at firstDate and iterate through until hit last date
    var workingDate = new Date(firstDate);
    var availableDays = [];
    for (var i = 0; i < displayableDays; i++) {
        var availableDay = new OnSchedHelpers.AvailableDay(workingDate);
        availableDays.push(availableDay);
        workingDate = OnSchedHelpers.AddDaysToDate(workingDate, 1);
    }
    return availableDays;
}

const getFirstDisplayableDate = date => {
    // first get the beginning of month
    // then go backwards to sunday
    var firstDayOfMonth = OnSchedHelpers.FirstDayOfMonth(date);
    var dow = firstDayOfMonth.getDay();
    var weekStartDate = OnSchedHelpers.AddDaysToDate(firstDayOfMonth, -dow);
    return weekStartDate;
}

const getAvailableMonthWeeks = (availableDays, date) => {
    // To render the calendar html with templates we need to transform the 
    // available days into an array of weeks of the month.
    var weeksInMonth = getDisplayableWeeks(date);
    var weekStartDate = OnSchedHelpers.ParseDate(availableDays[0].date);
    var monthWeeks = [];
    for (var i = 0; i < weeksInMonth; i++) {
        var week = [];
        for (var j = 0; j < 7; j++) {
            week.push(availableDays[i * 7 + j]);
        }
        weekStartDate = OnSchedHelpers.AddDaysToDate(weekStartDate, 7);
        monthWeeks.push(week);
    }
    return monthWeeks;
}

const getDisabledMonthPrev = availableDays => {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var firstDay = availableDays[0];
    var firstDayDate = OnSchedHelpers.ParseDate(firstDay.date);
    if (firstDay.reasonCode == 500 || firstDayDate == today)
        return "disabled=\"disabled\"";
    else
        return "";
}

const getDisabledMonthNext = availableDays => {
    var lastDay = availableDays[availableDays.length - 1];
    if (lastDay.reasonCode == 501)
        return "disabled=\"disabled\"";
    else
        return "";
}

export const calendarSelectorFromDate = (date, locale) => {
  // For a quick render of the calendar
  // we build day availability from the date
  var availableDays = availableDaysFromDate(date);
  return calendarSelector(availableDays, date, locale);
}

export const calendarSelector = (availableDays, date, locale) => {

  var options = { year: 'numeric', month: 'long' };

  var monthWeeks = getAvailableMonthWeeks(availableDays, date);

  const tmplCalendarHeader = `

      <div class="onsched-calendar-header">
          <div class="onsched-calendar-title" data-month="${date.getMonth()}" data-year="${date.getFullYear()}">
              ${date.toLocaleDateString(locale, options)}
          </div>
          <div class="onsched-progress-container">
              <div class="onsched-progress">
                  <div class="indeterminate"></div>
              </div>
          </div>
          <div style="display:inline-flex;margin-right:6px;">
              <button class="month-prev" type="button" ${getDisabledMonthPrev(availableDays)} 
                  title="Previous month" style="padding: 0 8px;" data-firstDay="${availableDays[0].date}">
                  &#10094;
              </button>
              <div style="width:20px;"></div>
              <button class="month-next" type="button" ${getDisabledMonthNext(availableDays)} 
                  title="Next month" style="padding: 0 8px;" data-lastDay="${availableDays[availableDays.length - 1].date}">
                  &#10095;
              </button>
          </div>
      </div>
  `;

  var weekdayDate = new Date(2020, 3-1, 1, 0, 0, 0); 

  const tmplCalendarWeekDayRow = `
      <div class="onsched-calendar-row onsched-weekdays">
          <div class="onsched-calendar-col dow" title="${weekdayDate.toLocaleDateString(locale,  {weekday: "long"})}">
              ${weekdayDate.toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 1).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 1).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 2).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 2).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 3).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 3).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 4).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 4).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 5).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 5).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
          <div class="onsched-calendar-col dow" title="${OnSchedHelpers.AddDaysToDate(weekdayDate, 6).toLocaleDateString(locale,  {weekday: "long"})}">
              ${OnSchedHelpers.AddDaysToDate(weekdayDate, 6).toLocaleDateString(locale,  {weekday: "short"})}
          </div>
      </div>
  `;

  const tmplCalendarWeekRow = days => `
  <div class="onsched-calendar-row">
  ${days.map(day => `
      <div class="onsched-calendar-col">
          <button class="day ${OnSchedHelpers.IsSelected(day, date)}" data-date="${day.date}" ${OnSchedHelpers.IsAvailable(day)} title="${day.reason}">${OnSchedHelpers.ParseDate(day.date).getDate()}</button>
      </div>
  `).join('')}
  </div>
  `;
  const tmplCalendarGrid = weeks => `
  <div class="onsched-calendar-grid">
  ${tmplCalendarWeekDayRow}
      <div class="onsched-calendar-rowgroup">
      ${weeks.map(week => `
          ${tmplCalendarWeekRow(week)}
      `).join('')}        
      </div>
  </div>
  `;

  const tmplCalendar = `
      ${tmplCalendarHeader}
      ${tmplCalendarGrid(monthWeeks)}
  `;

  return tmplCalendar;
}

const TzUtcTime = (tzData, date) => {
    var today = new Date();
    date = date == undefined ? today : date;
    for (var i = 0; i < tzData.length; i++) {
        var m = moment.tz(date, tzData[i].id);
        tzData[i].name += " " + "(UTC" + m.format("Z") + ")";
        tzData[i].offset = m.utcOffset();
    }
    return tzData;
}

    const TzUsCanada = date => {

    var tzData = [

        { "name": "Pacific Time", "id": "America/Los_Angeles", "offset": "0"},
        { "name": "Mountain Time", "id": "America/Denver", "offset": "0" },
        { "name": "Central Time", "id": "America/Chicago", "offset": "0" },
        { "name": "Eastern Time", "id": "America/New_York", "offset": "0" },
        { "name": "Alaska Time", "id": "America/Anchorage", "offset": "0" },
        { "name": "Hawaii Time", "id": "Pacific/Honolulu", "offset": "0" },
        { "name": "Atlantic Time", "id": "America/Halifax", "offset": "0" },
        { "name": "Newfoundland Time", "id": "America/St_Johns", "offset": "0" }
    ];

    return TzUtcTime(tzData, date);
}
const TzEurope = date => {
    var tzData = [

        { "name": "UK,Ireland,Lisbon", "id": "Europe/London", "offset": "0" },
        { "name": "Central European Time", "id": "Europe/Madrid", "offset": "0" },
        { "name": "Eastern European Time", "id": "Europe/Bucharest", "offset": "0" },
        { "name": "Minsk Time", "id": "Europe/Minsk", "offset": "0" },
    ];
    return TzUtcTime(tzData, date);
}
const TzAustralia = date => {
    var tzData = [

        { "name": "Australian Western Time", "id": "Australia/Perth", "offset": "0" },
        { "name": "Australian Central Western Time", "id": "Australia/Eucla", "offset": "0" },
        { "name": "Austrailian Adelaide Time", "id": "Australia/Adelaide", "offset": "0" },
        { "name": "Austrailian Brisbane Time", "id": "Australia/Brisbane", "offset": "0" },
        { "name": "Austrailian Eastern Time", "id": "Australia/Sydney", "offset": "0" },
        { "name": "Austrailian Lord Howe Time", "id": "Australia/Lord_Howe", "offset": "0" },
    ];
    return TzUtcTime(tzData, date);
}

export const Timezones = date => {
  var tzRegionData = [
      { "name": "US / Canada", "timezones": TzUsCanada(date) },
      { "name": "Europe", "timezones": TzEurope(date) },
      { "name": "Australia", "timezones": TzAustralia(date) },
  ];
  return tzRegionData;
}

const BusinessTzOption = value => {
    if (value == undefined) {
        return "";
    }
    else {
        const markup = `
            <option value="">Business Location Timezone</option>
        `;
        return markup;
    }
}

const TimezoneOptionGroups = (name, timezones) => {
    // need to do this template style in onschedjs
    const markup = `
        <optgroup label="${name}">              
        ${timezones.map((timezone, index) =>
        `<option value="${timezone.offset}" data-offset="${timezone.offset}" data-tz="${timezone.id}">${timezone.name}</option>`
        ).join("")}
        </optgroup>
    `;
    return markup;
}

export const TimezoneSelectOptions = (tzRegionData, businessTzOption) => {
  // need to do this template style in onschedjs
  const markup = `
      ${BusinessTzOption(businessTzOption)}
      ${tzRegionData.map((tzRegion, index) =>
          `${TimezoneOptionGroups(tzRegion.name, tzRegion.timezones)}`
      ).join("")}
  `;
  return markup;
}
