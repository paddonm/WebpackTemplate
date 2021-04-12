import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const OnChangeTimezone = (event, element) => {
  var el = event.target;
  var tzOffset = event.target.options[el.selectedIndex].value;
//        element.params["tzOffset"] = tzOffset;
  var elSelectedDate = document.querySelector(".onsched-calendar .day.selected");
  var selectedDate = OnSchedHelpers.ParseDate(elSelectedDate.dataset.date);
  var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, selectedDate, tzOffset);
  var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
  var dateSelectedTitle = selectedDate.toLocaleDateString(
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
