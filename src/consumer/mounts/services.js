import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const ServicesElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  var url = element.onsched.apiBaseUrl + "/services";
  url = element.options.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
  url = element.params.locationId !== null && element.params.locationId.length > 0 ?
      OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          OnSchedResponse.GetServices(element, response);
      })
  );
}
