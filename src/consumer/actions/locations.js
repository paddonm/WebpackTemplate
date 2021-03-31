export const GetLocation = (element, response) => {
  console.log('consumer responses GetLocation', element, response)
}

export const LocationsList = (element, response) => {
  var eventModel;
  var getLocationsEvent;
  if (response.error || response.count === 0) {
      eventModel = { message: 'No locations found matching search input.', searchText: element.params.nearestTo };
      getLocationsEvent = new CustomEvent("notFound", { detail: eventModel });
      var el = document.getElementById(element.id);
      el.dispatchEvent(getLocationsEvent);
      return;
  }
  var htmlLocations = OnSchedTemplates.locationsList(response);
  var el = document.getElementById(element.id);
  el.innerHTML = htmlLocations;
  // fire a custom event here
  eventModel = { 'object': response.object, 'hasMore': response.hasMore, 'count': response.count, 'total': response.total, 'data': response.data };
  getLocationsEvent = new CustomEvent("getLocations", { detail: eventModel });
  el.dispatchEvent(getLocationsEvent);
}
