import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'


export const MonthNext = (event, element) => {

  event.target.disabled = true;
  event.preventDefault = true;
//        console.log(event.target);

  var lastDayDate = OnSchedHelpers.ParseDate(event.target.dataset.lastday);
  var nextDate = OnSchedHelpers.AddDaysToDate(lastDayDate, 1);

  var elSelectTimezone = document.querySelector(".onsched-select.timezone");
  var tzOffset = elSelectTimezone != null ? elSelectTimezone.value : 0; 
  var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, nextDate, tzOffset);

  var calendarHtml = OnSchedTemplates.calendarSelectorFromDate(nextDate, element.onsched.locale);
  var elCalendar = document.querySelector(".onsched-calendar");
  elCalendar.innerHTML = calendarHtml;

  // calculate available days to pull when mounting
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
      OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(nextDate)));
  url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", OnSchedHelpers.GetCalendarDays(nextDate));
  url = OnSchedHelpers.AddUrlParam(url, "firstDayAvailable", "true");

  var elTimes = document.querySelector(".onsched-available-times");
  elTimes.innerHTML = "";

  var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
  elDow.innerHTML = nextDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
  var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
  elDom.innerHTML = nextDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });
  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = nextDate.toLocaleDateString(
      element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  elDateSelected.title = dateSelectedTitle;

  OnSchedHelpers.ShowProgress();
  // disable navigation while rest call in progress
  var elMonthPrev = document.querySelector(".onsched-availability button.month-prev");
  var elMonthNext = document.querySelector(".onsched-availability button.month-next");
  elMonthNext.disabled = true;
  elMonthPrev.disabled = true;        
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          var getAvailabilityEvent = new CustomEvent("getAvailability", { detail: response });
          document.getElementById('availability').dispatchEvent(getAvailabilityEvent);

          OnSchedResponse.GetAvailability(element, response);
      })
  );
}
