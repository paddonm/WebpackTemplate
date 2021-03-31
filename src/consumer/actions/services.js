const GetService = (element, response) => {
  console.log('consumer services GetService', element, response)
}

const ServicesList = (element, response) => {
  // GetServices response can originate from either the service or services element.
  var elServices = document.getElementById(element.id);
  var service = {};
  if (element.options.getFirst) {
      //
      if (response.count > 0) {
          service = response.data[0];
          var getServiceEvent = new CustomEvent("getService", { detail: service });
          elServices.dispatchEvent(getServiceEvent);
      }
  }
  else {
      var htmlServices = OnSchedTemplates.servicesList(response);
      elServices.innerHTML = htmlServices;
      // fire a custom event here
      var eventModel = {
          'object': response.object, 'hasMore': response.hasMore,
          'count': response.count, 'total': response.total, 'data': response.data
      };
      var getServicesEvent = new CustomEvent("getServices", { detail: eventModel });
      elServices.dispatchEvent(getServicesEvent);
  }
}

export { GetService, ServicesList }
