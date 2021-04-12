const GetResource = (element, response) => {
  console.log('consumer resources GetResource', element, response)
}

const ResourcesList = (element, response) => {
  var elResources = document.getElementById(element.id);
  var resource;

  if (element.options.getFirst) {
      if (response.count > 0) {
          resource = response.data[0];
          var getResourceEvent = new CustomEvent("getResource", { detail: resource });
          elResources.dispatchEvent(getResourceEvent);
      }
  }
  else {
      var htmlResources = OnSchedTemplates.resourcesList(response);
      elResources.innerHTML = htmlResources;
      // fire a custom event here
      var eventModel = {
          'object': response.object, 'hasMore': response.hasMore,
          'count': response.count, 'total': response.total, 'data': response.data
      };
      var getResourcesEvent = new CustomEvent("getResources", { detail: eventModel });
      elResources.dispatchEvent(getResourcesEvent);
  }
}

export { GetResource, ResourcesList }
