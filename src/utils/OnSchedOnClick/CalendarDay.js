import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'


export const CalendarDay = (event, element) => {
  var dayClicked = event.target;
  // implement logic here to switch the selection in UI and trigger availability call
  var calendarDays = document.querySelectorAll(".onsched-calendar-rowgroup .day");
  [].forEach.call(calendarDays, function (el) {
      el.className = el.className.replace(/\bselected\b/g, ""); // unselect all calendar days in UI
      // el.classList.remove("selected"); above method more browser friendly
  });

  // call logic to select day with the clicked element
  if (dayClicked.classList.contains("selected"))
      console.log("already selected");
  else
      dayClicked.classList.add("selected");

  var elSelectTimezone = document.querySelector(".onsched-select.timezone");
  var tzOffset = elSelectTimezone != null ? elSelectTimezone.value : 0;
  var title = document.querySelector(".onsched-calendar-header .onsched-calendar-title");
  var clickedDate = OnSchedHelpers.ParseDate(dayClicked.dataset.date);
  var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, clickedDate, tzOffset);
  if (clickedDate.getMonth() != title.dataset.month || clickedDate.getFullYear() != title.dataset.year) {
      var calendarHtml = OnSchedTemplates.calendarSelectorFromDate(clickedDate, element.onsched.locale);
      var elCalendar = document.querySelector(".onsched-calendar");
      elCalendar.innerHTML = calendarHtml;

      // calculate available days to pull when mounting
      url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
          OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(clickedDate)));
      url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", OnSchedHelpers.GetCalendarDays(clickedDate));
  }

  var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
  elDow.innerHTML = clickedDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
  var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
  elDom.innerHTML = clickedDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });
  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = clickedDate.toLocaleDateString(
      element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  elDateSelected.title = dateSelectedTitle;

  OnSchedHelpers.ShowProgress();
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getAvailabilityEvent = new CustomEvent("getAvailability", { detail: response });
          document.getElementById('availability').dispatchEvent(getAvailabilityEvent);

          OnSchedResponse.GetAvailability(element, response);
      })
  );
}
