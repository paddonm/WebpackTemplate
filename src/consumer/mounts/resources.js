import { OnSchedResponse } from '../../OnSchedResponse'
import { OnSchedRest }     from '../../OnSchedRest'

export const ResourcesElement = element => {
  var el = document.getElementById(element.id);
  el.addEventListener("click", element.onClick);
  url = element.onsched.apiBaseUrl + "/resources";
  if (OnSchedHelpers.IsEmpty(element.params.locationId) == false)
      url = OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId);
  if (OnSchedHelpers.IsEmpty(element.params.resourceGroupId) == false)
      url = OnSchedHelpers.AddUrlParam(url, "resourceGroupId", element.params.resourceGroupId);
  var url = element.options.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          OnSchedResponse.GetResources(element, response);
      })
  );
}
