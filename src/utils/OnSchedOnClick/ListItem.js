export const ListItem = (event, element) => {
  var itemClicked = event.target;
  // fire a custom event to element
  var eventModel;
  var elementType = itemClicked.dataset.element;
  if (elementType == "locations") {
      eventModel = { locationId: itemClicked.dataset.id };
      var elLocations = document.getElementById(element.id);
      var getLocationsEvent = new CustomEvent("clickLocation", { detail: eventModel });
      elLocations.dispatchEvent(getLocationsEvent);
  }
  else
  if (elementType == "services") {
      eventModel = { serviceId: itemClicked.dataset.id };
      var elServices = document.getElementById(element.id);
      var getServicesEvent = new CustomEvent("clickService", { detail: eventModel });
      elServices.dispatchEvent(getServicesEvent);
  }
  else
  if (elementType == "resources") {
      eventModel = { resourceId: itemClicked.dataset.id };
      var elResources = document.getElementById(element.id);
      var getResourcesEvent = new CustomEvent("clickResource", { detail: eventModel });
      elResources.dispatchEvent(getResourcesEvent);
  }
  else
  if (elementType == "allocations") {
      eventModel = { allocationId: itemClicked.dataset.id };
      var elAllocations = document.getElementById(element.id);
      var getAllocationsEvent = new CustomEvent("clickAllocation", { detail: eventModel });
      elAllocations.dispatchEvent(getAllocationsEvent);
  }
}
