export const AvailableTimes = (element, response) => {
  // TODO: any response error needs to be displayed and captured if not recoverable
  if (response.error) {
      console.log("Response Error: " + response.code);
      return;
  }
  // I need to update the calendar html from the availbleDays info in the response
  // I need to use the FirstAvailableDate in the response if is returned
  var selectedDate = response.firstAvailableDate.length > 0 ?
      OnSchedHelpers.ParseDate(response.firstAvailableDate) :
      OnSchedHelpers.ParseDate(response.startDate);

  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = selectedDate.toLocaleDateString(
      element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  elDateSelected.title = dateSelectedTitle;
  var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
  elDow.innerHTML = selectedDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
  var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
  elDom.innerHTML = selectedDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });

  var rebuildCalendar = response.availableDays.length > 0;
  if (rebuildCalendar) {
      // Helper function to get the number of displayable calendar days
      var days = OnSchedHelpers.GetCalendarDays(selectedDate);
      // We only take the number of availableDays that we need to populate the calendar, hence the slice.
      var availableDays = response.availableDays.length > days ? response.availableDays.slice(0, days) : response.availableDays;
      var elCalendar = document.querySelector(".onsched-calendar");
      elCalendar.innerHTML = OnSchedTemplates.calendarSelector(availableDays, selectedDate, element.onsched.locale);
      elDateSelected.title = dateSelectedTitle;
      var elTimezones = document.querySelector(".onsched-container.onsched-availability select.onsched-select.timezone");       
      elTimezones.innerHTML = OnSchedTemplates.TimezoneSelectOptions(OnSchedTemplates.Timezones(selectedDate));
      var elTimezone = document.querySelector(".onsched-select.timezone");
      elTimezone.value = response.tzRequested;
   }

  // Business name currently hidden. Leave logic for possible future use
  var elBusinessName = document.querySelector(".onsched-available-times-header .onsched-business-name");
  elBusinessName.innerHTML = response.businessName;

  var elServiceName = document.querySelector(".onsched-available-times-header .onsched-service-name");
  elServiceName.innerHTML = response.serviceName;

  var elServiceDuration = document.querySelector(".onsched-available-times-header .onsched-service-duration");
  var resourceName = response.resourceName;
  var durationAndResource = OnSchedHelpers.FormatDuration(response.serviceDuration);
  if (!OnSchedHelpers.IsEmpty(resourceName))
      durationAndResource += " - " + resourceName;
  elServiceDuration.innerHTML = durationAndResource;

  // Populate the available times list

  var htmlTimes = OnSchedTemplates.availableTimes2(response, selectedDate, element.params.customerId, element.onsched.locale);
  var elTimes = document.querySelector(".onsched-available-times");
  elTimes.innerHTML = htmlTimes;
}
