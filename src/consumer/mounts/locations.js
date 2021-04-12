import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const LocationSearchElement = element => {
  var el = document.getElementById(element.id);
  el.innerHTML = OnSchedTemplates.searchForm(element.params);
  OnSchedHelpers.HideProgress();
  // wire up events
  var elSearchForm = document.querySelector(".onsched-search-form");
  elSearchForm.addEventListener("submit", function (e) {
      e.preventDefault(); // before the code
      var elSearchText = document.querySelector(".onsched-search-form input[type=text]");
      var eventModel = { searchText: elSearchText.value};
      var clickSearchEvent = new CustomEvent("clicked", { detail: eventModel });
      el.dispatchEvent(clickSearchEvent);
  });
}

export const LocationsElement = element => {
  // are there any params or just options for locations?
  // need to support lookup by postalCode. API changes.
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  var url = element.onsched.apiBaseUrl + "/locations";
  url = element.params.units != null ? OnSchedHelpers.AddUrlParam(url, "units", element.params.units) : url;
  url = element.params.offset != null ? OnSchedHelpers.AddUrlParam(url, "offset", element.params.offset) : url;
  url = element.params.limit != null ? OnSchedHelpers.AddUrlParam(url, "limit", element.params.limit) : url;
  url = element.params.ignorePrimary != null ? OnSchedHelpers.AddUrlParam(url, "ignorePrimary", element.params.ignorePrimary) : url;
  url = OnSchedHelpers.AddUrlParam(url, "nearestTo", element.params.nearestTo);
  OnSchedHelpers.ShowProgress();
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          OnSchedResponse.GetLocations(element, response);
      })
  ).catch(e => console.log(e));
}
