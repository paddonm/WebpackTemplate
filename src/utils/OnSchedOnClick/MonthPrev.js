import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'


export const MonthPrev = (event, element) => {

  event.target.disabled = true;

  var firstDayDate = OnSchedHelpers.ParseDate(event.target.dataset.firstday);
  var prevDate = OnSchedHelpers.AddDaysToDate(firstDayDate, -1);
  prevDate = OnSchedHelpers.FirstDayOfMonth(prevDate);


  var elSelectTimezone = document.querySelector(".onsched-select.timezone");
  var tzOffset = elSelectTimezone != null ? elSelectTimezone.value : 0;        
  var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, prevDate, tzOffset);

  var calendarHtml = OnSchedTemplates.calendarSelectorFromDate(prevDate, element.onsched.locale);
  var elCalendar = document.querySelector(".onsched-calendar");
  elCalendar.innerHTML = calendarHtml;
  // calculate available days to pull when mounting
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
      OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(prevDate)));
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", OnSchedHelpers.GetCalendarDays(prevDate));
  url = OnSchedHelpers.AddUrlParam(url, "firstDayAvailable", "true");
  var elTimes = document.querySelector(".onsched-available-times");
  elTimes.innerHTML = "";

  var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
  elDow.innerHTML = prevDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
  var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
  elDom.innerHTML = prevDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });
  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = prevDate.toLocaleDateString(
      element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  elDateSelected.title = dateSelectedTitle;
  OnSchedHelpers.ShowProgress();
  var elMonthPrev = document.querySelector(".onsched-availability button.month-prev");
  elMonthPrev.disabled = true;        
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getAvailabilityEvent = new CustomEvent("getAvailability", { detail: response });
          document.getElementById('availability').dispatchEvent(getAvailabilityEvent);

          OnSchedResponse.GetAvailability(element, response);
      })
  );
}
