import { OnSchedRest }          from '../../OnSchedRest'
import { OnSchedResponse }      from '../../OnSchedResponse'
import { OnSchedWizardHelpers } from '../../utils/WizardHelpers/OnSchedWizardHelpers'


export const ServiceElement = element => {
    var el = document.getElementById(element.id);
    el.addEventListener("click", element.onClick);

    // url depends on getFirst or by serviceId
    if (element.params.serviceId != null && element.params.serviceId.length > 0) {
        url = element.onsched.apiBaseUrl + "/services/" + element.params.serviceId;
    }
    else
    if (element.options.getFirst) {
        url = element.onsched.apiBaseUrl + "/services";
        url = element.params.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
    }
    else
        return;

    var url = element.params.locationId != null && element.params.locationId.length > 0 ?
        OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

    // We build a url so call the endpoint now
    element.onsched.accessToken.then(x =>
        OnSchedRest.Get(x, url, function (response) {
            var getServiceEvent;
            var elService;
            if (response.object == "service") {
                elService = document.getElementById(element.id);
                getServiceEvent = new CustomEvent("getService", { detail: response });
                elService.dispatchEvent(getServiceEvent);
            }
            else {
                elService = document.getElementById(element.id);
                if (response.count > 0) {
                    var service = response.data[0]; // take the first service returned
                    getServiceEvent = new CustomEvent("getService", { detail: service });
                    elService.dispatchEvent(getServiceEvent);
                }
            }
        }) // end rest response
    ); // end promise
    return;
}

export const ServiceSetupElement = element => {
    var el = document.getElementById(element.id);

    // check for presence of id in params
    // if exists, then make get call and build UI with response data
    // otherwise
    // creating a fresh resource, use defaults incoming in params

    var defaultAvailability = {
        "mon": { "startTime": 900, "endTime": 1700 },
        "tue": { "startTime": 900, "endTime": 1700 },
        "wed": { "startTime": 900, "endTime": 1700 },
        "thu": { "startTime": 900, "endTime": 1700 },
        "fri": { "startTime": 900, "endTime": 1700 },
        "sat": { "startTime": 0, "endTime": 0 },
        "sun": { "startTime": 0, "endTime": 0 },
    };
    var defaultData = { showOnline: true, duration: 30, availability: defaultAvailability, settings: {}, options: {}, fees: {}};

    if (element.params.id == undefined || element.params.id.length == 0) {
        console.log("No Id present, create new resource");
        if (element.params.data == undefined)
            el.innerHTML = OnSchedTemplates.serviceSetup(element, defaultData);
        else {
            // make sure the supplied default data passed in params has availability
            // if not, we'll use our default availability
            if (element.params.data.availability == undefined)
                element.params.data.availability = defaultAvailability;
            if (element.params.data.contact == undefined)
                element.params.data.contact = {};

            if (element.options.suppressUI) {
                var serviceUrl = element.onsched.setupApiBaseUrl + "/services";
                element.onsched.accessToken.then(x =>
                    OnSchedRest.Post(x, serviceUrl, element.params.data, function (response) {
                        OnSchedResponse.PostService(element, response);
                    })
                );  
            }
            else {
                el.innerHTML = OnSchedTemplates.serviceSetup(element, element.params.data);
            }
        }

        if (!element.options.suppressUI) {
            OnSchedWizardHelpers.InitWizardDomElements(element);
            OnSchedWizardHelpers.InitServiceDomElements(element);
            OnSchedWizardHelpers.ShowWizardSection(0);
        }
    }
    else {
        console.log("Id present, get service and build UI from response data");
        var urlService = element.onsched.setupApiBaseUrl + "/services/" + element.params.id;
        OnSchedHelpers.ShowProgress();


      if (element.options.suppressUI && element.params.data) {
        element.onsched.accessToken.then(x =>
            OnSchedRest.Put(x, urlService, element.params.data, function (response) {
                OnSchedResponse.PutService(element, response);
            })
        );  
      }
      else {
        element.onsched.accessToken.then(x =>
            OnSchedRest.Get(x, urlService, function (response) {
                if (response.error) {
                    console.log("Rest error response code=" + response.code);
                    return;
                }
                console.log(response);
                // now render the initial UI from the response data
                el.innerHTML = OnSchedTemplates.serviceSetup(element, response);                    
                OnSchedWizardHelpers.InitWizardDomElements(element);
                OnSchedWizardHelpers.InitServiceDomElements(element);
                OnSchedWizardHelpers.ShowWizardSection(0);
            }) // end rest response
        ); // end promise     
      }
    }
}
