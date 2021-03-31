import { OnSchedHelpers }  from '../../utils/OnSchedHelpers'
import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const AvailabilityElement = element => {
  // new approach will be to create the container, load it
  // then replace the calendar element within the container
  element.params.date = OnSchedHelpers.IsEmpty(element.params.date) ? new Date() : element.params.date;
  element.timerId = null;

  var now = new Date();
  var tzOffset = -now.getTimezoneOffset();
//       element.params.tzOffset = OnSchedHelpers.IsEmpty(element.params.tzOffset) ? tzOffset : element.params.tzOffset;

  var html = OnSchedTemplates.availabilityContainer();
  var el = document.getElementById(element.id);
  el.innerHTML = html;
  // Now wire up events on the calendar
  el.addEventListener("click", element.onClick);
  el.addEventListener("change", element.onChange);
  var elTimezone = document.querySelector(".onsched-select.timezone");
  elTimezone.value = tzOffset;
  // initialize the calendar using only the date which is lightening fast
  var elCalendar = document.querySelector(".onsched-calendar");
  elCalendar.innerHTML = OnSchedTemplates.calendarSelectorFromDate(element.params.date, element.onsched.locale);
  var elTimes = document.querySelector(".onsched-available-times");
  elTimes.innerHTML = "";
  var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, element.params.date, tzOffset);

  // calculate available days to pull when mounting
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
      OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(element.params.date)));
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", 100);
  url = OnSchedHelpers.AddUrlParam(url, "firstDayAvailable", "true");
  // add additional parameters
  if (element.params.duration) url = OnSchedHelpers.AddUrlParam(url, "duration", element.params.duration);
  if (element.params.interval) url = OnSchedHelpers.AddUrlParam(url, "interval", element.params.interval);

  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = element.params.date.toLocaleDateString(
      element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  elDateSelected.title = dateSelectedTitle;

  var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
  elDow.innerHTML = element.params.date.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
  var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
  elDom.innerHTML = element.params.date.toLocaleDateString(element.onsched.locale, { day: 'numeric' });

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getAvailabilityEvent = new CustomEvent("getAvailability", { detail: response });
          el.dispatchEvent(getAvailabilityEvent);

          OnSchedResponse.GetAvailability(element, response);
      })
  );
}

export const ConfirmationElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  if (element.params.appointment === null)
      return;
  // render with a template. element.params.appointment object
  el.innerHTML = OnSchedTemplates.confirmation(element.params.appointment, element.onsched.locale);
}
