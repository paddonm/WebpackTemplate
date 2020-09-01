/*!
 * OnSchedJ (http://onsched.com)
 * Copyright 2014-2020 OnSched
 */

'use strict';
import * as Sentry from '@sentry/browser';
import moment from 'moment';
import momenttimezone from 'moment-timezone';

import './assets/css/index.css';
import placeholderIcon from './assets/img/image-placeholder.png';
import { configureScope } from '@sentry/browser';

Sentry.init({
    dsn: "https://b1d16d94d7944f158fbd14c8060cf569@o77015.ingest.sentry.io/5245178",
    release: __VERSION__
});
 

// Main entry point for OnSched.js

function OnSched(ClientId, Environment, Options) {

    // Should probably include scope in an Options object
    var self = {};
    self.objectName = "OnSched";
    self.scope = Options === undefined ? "OnSchedApi" : Options.scope;
    self.locale = Options === undefined || Options.locale == null ? "en-US" : Options.locale;
    self.clientId = ClientId;
    self.environment = Environment === null ? "live" : Environment;
    self.environment = self.environment === "live" || self.environment === "sbox" ? self.environment : "sbox";
    self.apiBaseUrl = self.environment === "live" ?
        "https://api.onsched.com/consumer/v1" :
        "https://sandbox-api.onsched.com/consumer/v1";
    self.setupApiBaseUrl = self.environment === "live" ?
        "https://api.onsched.com/setup/v1" :
        "https://sandbox-api.onsched.com/setup/v1";

    //    self.accessToken = OnSchedRest.GetAccessToken(self.environment);
    self.accessToken = OnSchedRest.Authorize(self.clientId, self.environment, self.scope);

    // Elements method that creates elements instance
    self.elements = function () {
        var elements = {};
        elements.objectName = "OnSched.elements";
        // elements.create method for creating an element
        elements.create = function (type, params, options) {
            var element = {};
            element.onsched = self;
            element.objectName = "OnSched.element";
            element.type = type;

            // check for params based on type? e.g. date is not relevant for all types
            element.params = params;
            element.options = options;

            ///
            /// element.mount method for mounting the created element in the DOM
            /// Much happens in the mount. API calls and templating of html.
            /// Bulk of exceptions likely to happen here.
            ///

            element.mount = function (id) {

                try {
                    element.id = id;

                    var el = document.getElementById(id);
                    // TODO - raise app error event
                    if (el === null)
                        throw "OnSched.mount: Element with id=" + id + " doesn't exist.";


                    switch (element.type) {
                        case "availability":
                            OnSchedMount.AvailabilityElement(this);
                            break;
                        case "customer":
                            OnSchedMount.CustomerElement(this);
                            break;
                        case "appointment":
                            OnSchedMount.AppointmentElement(this);
                            break;
                        case "confirmation":
                            OnSchedMount.ConfirmationElement(this);
                            break;
                        case "location":
                            OnSchedMount.LocationElement(this);
                            break;
                        case "locations":
                            OnSchedMount.LocationsElement(this);
                            break;
                        case "resource":
                            OnSchedMount.ResourceElement(this);
                            break;
                        case "resources":
                            OnSchedMount.ResourcesElement(this);
                            break;
                        case "service":
                            OnSchedMount.ServiceElement(this);
                            break;
                        case "services":
                            OnSchedMount.ServicesElement(this);
                            break;
                        case "search":
                            OnSchedMount.SearchElement(this);
                            break;
                        case "locationSetup":
                            OnSchedMount.LocationSetupElement(this);
                            break;
                        case "resourceSetup":
                            OnSchedMount.ResourceSetupElement(this);
                            break;
                        case "serviceSetup":
                            OnSchedMount.ServiceSetupElement(this);
                            break;
                            default:
                            // TODO - raise App error event
                            console.log("Unsupported element " + element.type);
                            html = "Unsupported element";
                            break;
                    }
                } catch (e) {
                    // TODO - raise error event to the app client
                    console.log("OnSched.mount failed id=" + element.id + " type=" + element.type);
                    console.log(e);
                }
            };

            element.update = function (params, options) {
                // TODO - generate error here for client
                if (typeof params !== "object")
                    return;
                element.params = params != null ? params : element.params;
                element.options = options != null ? options : element.options;
                // I need to update DOM elements in cases like the search element
                if (element.type == "search") {
                    var elSearchText = document.querySelector(".onsched-search-form input[name=searchText]");
                    elSearchText.value = params.searchText !== null ? params.searchText : elSearchText.value;
                    elSearchText.placeholder = params.placeholder !== null ? params.placeholder : elSearchText.placeholder;
                    var elMessage = document.querySelector(".onsched-search-form p");
                    elMessage.textContent = params.message !== null ? params.message : elMessage.textContent;
                }
            };

            element.onChange = function (event) {
                if (event.target.classList.contains("onsched-select") && event.target.classList.contains("timezone"))
                    OnSchedOnChange.OnChangeTimezone(event, element);
            };

            element.onClick = function (event) {
                if (event.target.classList.contains("day"))
                    OnSchedOnClick.CalendarDay(event, element);
                else
                if (event.target.classList.contains("time"))
                    OnSchedOnClick.AvailableTime(event, element);
                else
                if (event.target.classList.contains("list-item"))
                    OnSchedOnClick.ListItem(event, element);
                else
                if (event.target.classList.contains("month-prev"))
                    OnSchedOnClick.MonthPrev(event, element);
                else
                if (event.target.classList.contains("month-next"))
                    OnSchedOnClick.MonthNext(event, element);
//                if (event.target.classList.contains("btn-submit") == false)
//                    event.preventDefault();
            };

            element.handleException = function (e) {
                // add the Sentry logic here
                // also need to send some feedback to the user
            };

            return element; // return a reference to the element object for chaining
        };


        return elements; // return a reference to the elements object for chaining
    };

    self.logError = function (error) {
        Sentry.captureException(error);
    };

    return self; // return reference to the OnSched object for chaining
}


var OnSchedMount = function () {

    function SearchElement(element) {
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

    function ServicesElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        var url = element.onsched.apiBaseUrl + "/services";
        url = element.options.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
        url = element.params.locationId !== null && element.params.locationId.length > 0 ?
            OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

        element.onsched.accessToken.then(x =>
            OnSchedRest.GetServices(x, url, function (response) {
                OnSchedResponse.GetServices(element, response);
            })
        );
    }

    function LocationsElement(element) {
        // are there any params or just options for locations?
        // need to support lookup by postalCode. API changes.
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        var url = element.onsched.apiBaseUrl + "/locations";
        url = element.params.units != null ? OnSchedHelpers.AddUrlParam(url, "units", element.params.units) : url;
        url = element.params.offset != null ? OnSchedHelpers.AddUrlParam(url, "offset", element.params.offset) : url;
        url = element.params.limit != null ? OnSchedHelpers.AddUrlParam(url, "limit", element.params.limit) : url;
        url = OnSchedHelpers.AddUrlParam(url, "nearestTo", element.params.nearestTo);
        OnSchedHelpers.ShowProgress();
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetLocations(x, url, function (response) {
                OnSchedResponse.GetLocations(element, response);
            })
        ).catch(e => console.log(e));
    }

    function AvailabilityElement(element) {
        // new approach will be to create the container, load it
        // then replace the calendar element within the container
        element.params.date = OnSchedHelpers.IsEmpty(element.params.date) ? new Date() : element.params.date;
        element.timerId = null;

        var now = new Date();
        var tzOffset = -now.getTimezoneOffset();
        element.params.tzOffset = OnSchedHelpers.IsEmpty(element.params.tzOffset) ? tzOffset : element.params.tzOffset;

        var html = OnSchedTemplates.availabilityContainer();
        var el = document.getElementById(element.id);
        el.innerHTML = html;
        // Now wire up events on the calendar
        el.addEventListener("click", element.onClick);
        el.addEventListener("change", element.onChange);
        var elTimezone = document.querySelector(".onsched-select.timezone");
        elTimezone.value = element.params.tzOffset;
        // initialize the calendar using only the date which is lightening fast
        var elCalendar = document.querySelector(".onsched-calendar");
        elCalendar.innerHTML = OnSchedTemplates.calendarSelectorFromDate(element.params.date, element.onsched.locale);
        var elTimes = document.querySelector(".onsched-available-times");
        elTimes.innerHTML = "";
        var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params);

        // calculate available days to pull when mounting
        url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
            OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(element.params.date)));
        url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", 100);
        url = OnSchedHelpers.AddUrlParam(url, "firstDayAvailable", "true");
        // add additional parameters
        if (element.params.duration) url = OnSchedHelpers.AddUrlParam(url, "duration", element.params.duration);
        if (element.params.interval) url = OnSchedHelpers.AddUrlParam(url, "interval", element.params.interval);

        var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
        var dateSelectedTitle = element.params.date.toLocaleDateString(
            element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        elDateSelected.title = dateSelectedTitle;

        var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
        elDow.innerHTML = element.params.date.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
        var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
        elDom.innerHTML = element.params.date.toLocaleDateString(element.onsched.locale, { day: 'numeric' });

        element.onsched.accessToken.then(x =>
            OnSchedRest.GetAvailability(x, url, function (response) {
                OnSchedResponse.GetAvailability(element, response);
            })
        );
    }

    function CustomerElement(element) {
        // When I mount customer and have everything, I can immediately do a customer post
        // then I can fire an event and return the customerId created.
        // Normal flow, form loads on mount and wait for a Submit
        // Alternate flow, customer data exists so just POST the customer with supplied data
        // It still happens on mount because I also need to send event back to the customer element
        // What if the same customer booking second time around. Avalailability could provide the 
        // customerId. 
        var url = element.onsched.apiBaseUrl + "/customers";
        url = OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId);
        url = OnSchedHelpers.AddUrlParam(url, "email", element.params.email);
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetCustomers(x, url, function (response) {
                OnSchedResponse.GetCustomers(element, response);
            })
        );
    }

    function LocationElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        var url = element.onsched.apiBaseUrl + "/locations/" + element.params.locationId;

        if (element.params.locationId === null || element.params.locationId.length === 0)
            return;

        // We built a url so call the endpoint now
        element.onsched.accessToken.then(x =>
            OnSchedRest.Get(x, url, function (response) {
                var getLocationEvent = new CustomEvent("getLocation", { detail: response });
                el.dispatchEvent(getLocationEvent);
            }) // end rest response
        ); // end promise
        return;
    }
    function AppointmentElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        var url = element.onsched.apiBaseUrl + "/appointments/" + element.params.appointmentId;

        if (element.params.appointmentId === null || element.params.appointmentId.length === 0) {
            console.log("A valid appointmentId not present.");
            return;
        }

        // We built the url so call the endpoint now
        element.onsched.accessToken.then(x =>
            OnSchedRest.Get(x, url, function (response) {
                if (response.error)
                    console.log("Rest error response code=" + response.code);
                // If not confirming the appointment, then just fire an event with the response
                if (element.options.confirm == undefined || element.options.confirm == false) {
                    var getAppointmentEvent = new CustomEvent("getAppointment", { detail: response });
                    el.dispatchEvent(getAppointmentEvent);
                }
                else {
                    // confirm option is set to we call the PUT /appointments/{id}/confirm
                    var confirmUrl = element.onsched.apiBaseUrl + "/appointments/" + element.params.appointmentId + "/confirm";
                    var payload = {};
                    element.onsched.accessToken.then(x => 
                        OnSchedRest.Put(x, confirmUrl, payload, function(response) {
                            if (response.error) {
                                console.log("Rest error response code=" + response.code);
                            }
                            else {
                                var confirmAppointmentEvent = new CustomEvent("confirmAppointment", { detail: response });
                                el.dispatchEvent(confirmAppointmentEvent);  
                            }
                          
                        }) // end rest response
                    ); // end promise
                }

            }) // end rest response
        ); // end promise
        return;
    }

    function ConfirmationElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        if (element.params.appointment === null)
            return;
        // render with a template. element.params.appointment object
        el.innerHTML = OnSchedTemplates.confirmation(element.params.appointment, element.onsched.locale);
    }

    function ServiceElement(element) {
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
            OnSchedRest.GetServices(x, url, function (response) {
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

    function ResourcesElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        url = element.onsched.apiBaseUrl + "/resources";
        if (OnSchedHelpers.IsEmpty(element.params.locationId) == false)
            url = OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId);
        if (OnSchedHelpers.IsEmpty(element.params.resourceGroupId) == false)
            url = OnSchedHelpers.AddUrlParam(url, "resourceGroupId", element.params.resourceGroupId);
        var url = element.options.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetResources(x, url, function (response) {
                OnSchedResponse.GetResources(element, response);
            })
        );
    }
    function ResourceElement(element) {
        var el = document.getElementById(element.id);
        el.addEventListener("click", element.onClick);
        // url depends on getFirst or by serviceId
        if (element.params.resourceId != null && element.params.resourceId.length > 0)
            url = element.onsched.apiBaseUrl + "/resources/" + element.params.resourceId;
        else
        if (element.options.getFirst) {
            url = element.onsched.apiBaseUrl + "/resources";
            url = element.params.getFirst ? OnSchedHelpers.AddUrlParam(url, "limit", "1") : url;
        }
        else
            return;

        var url = element.params.locationId != null && element.params.locationId.length > 0 ?
            OnSchedHelpers.AddUrlParam(url, "locationId", element.params.locationId) : url;

        // We built a url so call the endpoint now
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetResources(x, url, function (response) {
                var getResourceEvent;
                var elResource = document.getElementById(element.id);
                if (response.object == "resource") {
                    getResourceEvent = new CustomEvent("getResource", { detail: response });
                    elResource.dispatchEvent(getResourceEvent);
                }
                else {
                    if (response.count > 0) {
                        var resource = response.data[0]; // take the first resource returned
                        getResourceEvent = new CustomEvent("getResource", { detail: resource });
                        elResource.dispatchEvent(getResourceEvent);
                    }
                }
            }) // end rest response
        ); // end promise
    } 
    function LocationSetupElement(element) {

        var el = document.getElementById(element.id);
        // check for presence of id in params
        // if exists, then make get call and build UI with response data
        // otherwise

        // creating a fresh location, use defaults incoming in params.data or
        // use the system defaults created here.

        var defaultBusinessHours = {
            "mon": { "startTime": 900, "endTime": 1700 },
            "tue": { "startTime": 900, "endTime": 1700 },
            "wed": { "startTime": 900, "endTime": 1700 },
            "thu": { "startTime": 900, "endTime": 1700 },
            "fri": { "startTime": 900, "endTime": 1700 },
            "sat": { "startTime": 0, "endTime": 0 },
            "sun": { "startTime": 0, "endTime": 0 },
        };

        var defaultData = { name:"Test Location", address:{ "state": "ON", "country": "CA" }, businessHours: defaultBusinessHours, settings: {}};

        if (element.params.id == undefined) {
            // build the base html template for this wizard
            if (element.params.data == undefined)
                el.innerHTML = OnSchedTemplates.locationSetup(element.onsched.locale, defaultData);
            else {
                // make sure the supplied default data passed in params has busnessHours
                // if not, we'll use our default businessHours
                if (element.params.data.businessHours == undefined)
                    element.params.data.businessHours = defaultBusinessHours;
                el.innerHTML = OnSchedTemplates.locationSetup(element.onsched.locale, element.params.data);
            }
            OnSchedWizardHelpers.InitWizardDomElements(element);
            OnSchedWizardHelpers.InitLocationDomElements(element);
            OnSchedWizardHelpers.ShowWizardSection(0);
            // default the timezone for a new location
            if (element.params.tzOffset != undefined || element.params.tzOffset.length == 0) {
                var elTimezoneSelect = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName");
                elTimezoneSelect.value = element.params.tzOffset;
            }
        }   
        else {
            var urlLocation = element.onsched.apiBaseUrl + "/locations/" + element.params.id;

            OnSchedHelpers.ShowProgress();
            element.onsched.accessToken.then(x =>
                OnSchedRest.GetLocations(x, urlLocation, function (response) {
                    if (response.error) {
                        console.log("Rest error response code=" + response.code);
                        return;
                    }
                    // now render the initial UI from the response data
                    el.innerHTML = OnSchedTemplates.locationSetup(element.onsched.locale, response);                    
                    OnSchedWizardHelpers.InitWizardDomElements(element);
                    OnSchedWizardHelpers.InitLocationDomElements(element);
                    OnSchedWizardHelpers.SelectOptionMatchingData("select[name=timezoneName]", "tz", response.timezoneIana);

                    OnSchedWizardHelpers.ShowWizardSection(0);
                }) // end rest response
            ); // end promise        
        }
    }
    function ResourceSetupElement(element) {

        var el = document.getElementById(element.id);

        // check for presence of id in params
        // if exists, then make get call and build UI with response data
        // otherwise
        // creating a fresh resource, use defaults incoming in params
        // creating a fresh location, use defaults incoming in params.data or
        // use the system defaults created here.

        var defaultAvailability = {
            "mon": { "startTime": 900, "endTime": 1700 },
            "tue": { "startTime": 900, "endTime": 1700 },
            "wed": { "startTime": 900, "endTime": 1700 },
            "thu": { "startTime": 900, "endTime": 1700 },
            "fri": { "startTime": 900, "endTime": 1700 },
            "sat": { "startTime": 0, "endTime": 0 },
            "sun": { "startTime": 0, "endTime": 0 },
        };

        var defaultData = { name:"Test Resource", address:{ "state": "ON", "country": "CA" }, availability: defaultAvailability, settings: {}};

        if (element.params.id == "undefined" || element.params.id.length == 0) {
            if (element.params.data == undefined)
                el.innerHTML = OnSchedTemplates.resourceSetup(element.onsched.locale, defaultData);
            else {
                // make sure the supplied default data passed in params has availability
                // if not, we'll use our default availability
                if (element.params.data.availability == undefined)
                    element.params.data.availability = defaultAvailability;
                if (element.params.data.contact == undefined)
                    element.params.data.contact = {};

                el.innerHTML = OnSchedTemplates.resourceSetup(element.onsched.locale, element.params.data);
            }
            OnSchedWizardHelpers.InitWizardDomElements(element);
            OnSchedWizardHelpers.InitResourceDomElements(element);
            OnSchedWizardHelpers.ShowWizardSection(0);
            // default the timezone for a new resource
            if (element.params.tzOffset != undefined || element.params.tzOffset.length == 0) {
                var elTimezoneSelect = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName");
//                elTimezoneSelect.value = element.params.tzOffset;
                elTimezoneSelect.value = "";
            }
        }
        else {
            var urlResource = element.onsched.apiBaseUrl + "/resources/" + element.params.id;
            OnSchedHelpers.ShowProgress();
            element.onsched.accessToken.then(x =>
                OnSchedRest.GetResources(x, urlResource, function (response) {
                    if (response.error) {
                        console.log("Rest error response code=" + response.code);
                        return;
                    }
                    console.log(response);
                    // now render the initial UI from the response data
                    el.innerHTML = OnSchedTemplates.resourceSetup(element.onsched.locale, response);                    
                    OnSchedWizardHelpers.InitWizardDomElements(element);
                    OnSchedWizardHelpers.InitResourceDomElements(element);
                    OnSchedWizardHelpers.SelectOptionMatchingData("select[name=timezoneName]", "tz", response.timezoneIana);

                    OnSchedWizardHelpers.ShowWizardSection(0);
                }) // end rest response
            ); // end promise     
        }
           
    }

    function ServiceSetupElement(element) {
        var el = document.getElementById(element.id);
        // check for presence of id in params
        // if exists, then make get call and build UI with response data
        // otherwise
        // creating a fresh resource, use defaults incoming in params
        if (element.params.Id == "undefined")
            console.log("No Id present, create new resource");
        else
            console.log("Id present, get resource and build UI from response data");

            el.innerHTML = OnSchedTemplates.serviceSetup();

            if (element.params.tzOffset != undefined || element.params.tzOffset.length == 0) {
                var elTimezoneSelect = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName");
                elTimezoneSelect.value = element.params.tzOffset;
            }
    
            var elWizardForm = document.querySelector(".onsched-wizard.onsched-form");
            elWizardForm.addEventListener("submit", OnSchedWizardHelpers.WizardSubmitHandler);
            var elPrevButton = document.querySelector(".onsched-wizard-nav-buttons .prevButton");
            elPrevButton.addEventListener("click", OnSchedWizardHelpers.WizardPrevHandler);
    
            var htmlBusinessHours = OnSchedTemplates.businessHoursTable(element.onsched.locale, element.params.businessHours);
            var elBusinessHours = document.querySelector(".onsched-business-hours");
            elBusinessHours.innerHTML = htmlBusinessHours;
    
            var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
            var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
            elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;
            elBusinessTimezone.addEventListener("change", function(event) {
                var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
                var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
                elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;
        
            }, false);
    
            // Consider adding this to OnSchedOnClick
            elWizardForm.addEventListener("click", function (event) {
                if (event.target.classList.contains("onsched-dropdown-menu-button")) {
                    // first clear any displayed dropdown menus
                    var menus = document.querySelectorAll(".onsched-dropdown-menu");
                    for (var i = 0; i < menus.length; i++) {
                        menus[i].style.display = "none";
                    }
                    var menu = event.target.nextElementSibling;
                    if (menu.style.display != "none")
                        menu.style.display = "none";
                    else
                        menu.style.display = "block";
                    event.preventDefault();
                }
                else
                if (event.target.classList.contains("onsched-dropdown-menu-item")) {
                    // need to call logic to show hide start/end times info.
                    var businessHoursDay = event.target.closest(".onsched-business-hours-day");
                    var day = businessHoursDay.classList[businessHoursDay.classList.length - 1];
    
                    var startTimeColClass = ".onsched-business-hours-row.start .onsched-business-hours-time" + "." + day;
                    var startTimeCol = document.querySelector(startTimeColClass);
                    OnSchedWizardHelpers.UpdateBusinessHoursTime(startTimeCol, event.target.name);
    
                    var endTimeColClass = ".onsched-business-hours-row.end .onsched-business-hours-time" + "." + day;
                    var endTimeCol = document.querySelector(endTimeColClass);
                    OnSchedWizardHelpers.UpdateBusinessHoursTime(endTimeCol, event.target.name);
    
                    var li = event.target.parentElement;
                    var menu = li.parentElement;
                    event.preventDefault();
                    menu.style.display = "none";
                }
                else {
                    // something else clicked
                    // make all the drop-down-menu's hidden
                    var menus = document.querySelectorAll(".onsched-dropdown-menu");
                    for (var i = 0; i < menus.length; i++) {
                        menus[i].style.display = "none";
                    }
                }
    
            }, false);
    
            OnSchedWizardHelpers.ShowWizardSection(0);
    
            // Call the endpoint to receive all system states
            // and use data to populate the states options and country options
    
            var url = element.onsched.apiBaseUrl + "/customers/states";
    
            element.onsched.accessToken.then(x =>
                OnSchedRest.GetCustomers(x, url, function (response) {
                    var stateOptionsHtml = OnSchedTemplates.stateSelectOptions(response);
                    var elStateSelect = document.querySelector(".onsched-wizard.onsched-form select[name=state]");
                    elStateSelect.innerHTML = stateOptionsHtml;
                    var countryOptionsHtml = OnSchedTemplates.countrySelectOptions(response);
                    var elCountrySelect = document.querySelector(".onsched-wizard.onsched-form select[name=country]");
                    elCountrySelect.innerHTML = countryOptionsHtml;
     
                }) // end rest response
            ); // end promise    
    }

    return {
        SearchElement: SearchElement,
        LocationsElement: LocationsElement,
        ServicesElement: ServicesElement,
        ResourcesElement: ResourcesElement,
        AvailabilityElement: AvailabilityElement,
        CustomerElement: CustomerElement,
        LocationElement: LocationElement,
        AppointmentElement: AppointmentElement,
        ConfirmationElement: ConfirmationElement,
        ServiceElement: ServiceElement,
        ResourceElement: ResourceElement,
        LocationSetupElement: LocationSetupElement,
        ResourceSetupElement: ResourceSetupElement,
        ServiceSetupElement: ServiceSetupElement
    };
}(); // End OnSchedMount

var OnSchedWizardHelpers = function () {
    function WizardSubmitHandler(event, element) {
        var elStep = document.querySelector(".onsched-wizard input[name=step]")
        var step = parseInt(elStep.value);
        var elWizardSections = document.querySelectorAll(".onsched-wizard .onsched-wizard-section");

        if (step == elWizardSections.length - 1) {
            var form = document.querySelector(".onsched-wizard.onsched-form");
            console.log("In WizardSubmitHandler form="+form.getAttribute("name"));
            switch(form.getAttribute("name")) {
                case "locationSetup":
                    if (element.params.id == undefined || element.params.id.length == 0) {
                        console.log("POST /locations");
                        var postData = GetLocationPostData(form.elements);
                        var locationsUrl = element.onsched.setupApiBaseUrl + "/locations";
                        OnSchedHelpers.ShowProgress();
                        element.onsched.accessToken.then(x =>
                            OnSchedRest.PostLocation(x, locationsUrl, postData, function (response) {
                                OnSchedResponse.PostLocation(element, response);
                            })
                        );
                    }
                    else {
                        var putData = GetLocationPutData(form.elements);
                        var locationsUrl = element.onsched.setupApiBaseUrl + "/locations/"+ element.params.id;
                        OnSchedHelpers.ShowProgress();
                        element.onsched.accessToken.then(x =>
                            OnSchedRest.PutLocation(x, locationsUrl, putData, function (response) {
                                OnSchedResponse.PutLocation(element, response);
                            })
                        );                        
                    }
                    break;
                case "resourceSetup":
                    if (element.params.id == undefined || element.params.id.length == 0) {
                        var postData = GetResourcePostData(form.elements, element);
                        var resourcesUrl = element.onsched.setupApiBaseUrl + "/resources";
                        resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "googleAuthReturnUrl", element.params.googleAuthReturnUrl);
                        resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "outlookAuthReturnUrl", element.params.googleAuthReturnUrl);
                        OnSchedHelpers.ShowProgress();
                        element.onsched.accessToken.then(x =>
                            OnSchedRest.PostResource(x, resourcesUrl, postData, function (response) {
                                OnSchedResponse.PostResource(element, response);
                            })
                        );
                    }
                    else {
                        var putData = GetResourcePutData(form.elements, element);
                        var resourceUrl = element.onsched.setupApiBaseUrl + "/resources/"+ element.params.id;
                        resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "googleAuthReturnUrl", element.params.googleAuthReturnUrl);
                        resourcesUrl = OnSchedHelpers.AddUrlParam(resourcesUrl, "outlookAuthReturnUrl", element.params.googleAuthReturnUrl);
                        OnSchedHelpers.ShowProgress();
                        element.onsched.accessToken.then(x =>
                            OnSchedRest.PutResource(x, resourceUrl, putData, function (response) {
                                OnSchedResponse.PutResource(element, response);
                            })
                        );                        
                    }                        
                break;
                case "serviceSetup":
                    if (element.params.id == undefined || element.params.id.length == 0) {
                        console.log("POST /services");
                    }
                    else {
                        console.log("PUT /services");
                    }
                    break;
                 default:
                    console.log("WizardSubmtHandler: unknown form submitted"+ " "+ form.name);         
            }            
        }
        else {
            // update the new step value
            step = step + 1;
            elStep.value = step;
            ShowWizardSection(step);
        }

        event.preventDefault();
        
        return false;
    }
    function InitWizardDomElements(element) {
        // MAY BE NOTHING IN THE DOM YET
        var elWizardForm = document.querySelector(".onsched-wizard.onsched-form");
        elWizardForm.addEventListener("submit", (event) => OnSchedWizardHelpers.WizardSubmitHandler(event, element));
        var elPrevButton = document.querySelector(".onsched-wizard-nav-buttons .prevButton");
        elPrevButton.addEventListener("click", OnSchedWizardHelpers.WizardPrevHandler);

        var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
        var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
        elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;
        elBusinessTimezone.addEventListener("change", function(event) {
            var elBusinessTimezone = document.querySelector(".onsched-wizard.onsched-form select[name=timezoneName]");
            var elBusinessHoursTz = document.querySelector("h4.onsched-business-hours-tz");
            elBusinessHoursTz.innerHTML = elBusinessTimezone.options[elBusinessTimezone.selectedIndex].text;;

        }, false);

        // This click handler focuses on actions for the business hours, and availability hours.
        // A click will either hide or show a dropdown menu

        elWizardForm.addEventListener("click", function (event) {
            if (event.target.classList.contains("onsched-dropdown-menu-button")) {
                // first clear any displayed dropdown menus
                var menus = document.querySelectorAll(".onsched-dropdown-menu");
                for (var i = 0; i < menus.length; i++) {
                    menus[i].style.display = "none";
                }
                var menu = event.target.nextElementSibling;
                if (menu.style.display != "none")
                    menu.style.display = "none";
                else
                    menu.style.display = "block";
                event.preventDefault();
            }
            else
            if (event.target.classList.contains("onsched-dropdown-menu-item")) {
                // need to call logic to show hide start/end times info.
                var businessHoursDay = event.target.closest(".onsched-business-hours-day");
                var day = businessHoursDay.classList[businessHoursDay.classList.length - 1];

                var startTimeColClass = ".onsched-business-hours-row.start .onsched-business-hours-time" + "." + day;
                var startTimeCol = document.querySelector(startTimeColClass);
                OnSchedWizardHelpers.UpdateBusinessHoursTime(startTimeCol, event.target.name);

                var endTimeColClass = ".onsched-business-hours-row.end .onsched-business-hours-time" + "." + day;
                var endTimeCol = document.querySelector(endTimeColClass);
                OnSchedWizardHelpers.UpdateBusinessHoursTime(endTimeCol, event.target.name);

                var li = event.target.parentElement;
                var menu = li.parentElement;
                event.preventDefault();
                menu.style.display = "none";
            }
            else {
                // something else clicked
                // make all the drop-down-menu's hidden
                var menus = document.querySelectorAll(".onsched-dropdown-menu");
                for (var i = 0; i < menus.length; i++) {
                    menus[i].style.display = "none";
                }
            }

            }, false); // end of onclick processing

            // Call the endpoint to receive all system states
            // and use data to populate the states options and country options

            var url = element.onsched.apiBaseUrl + "/customers/states";

            element.onsched.accessToken.then(x =>
                OnSchedRest.GetCustomers(x, url, function (response) {
                    var stateOptionsHtml = OnSchedTemplates.stateSelectOptions(response);
                    var elStateSelect = document.querySelector(".onsched-wizard.onsched-form select[name=state]");
                    elStateSelect.innerHTML = stateOptionsHtml;
                    elStateSelect.value = element.params.data.address.state;
                    var countryOptionsHtml = OnSchedTemplates.countrySelectOptions(response);
                    var elCountrySelect = document.querySelector(".onsched-wizard.onsched-form select[name=country]");
                    elCountrySelect.innerHTML = countryOptionsHtml;
                    elCountrySelect.value = element.params.data.address.country;    
                }) // end rest response
            ); // end promise
    }
    function InitLocationDomElements(element) {
        // move some code from the InitWizardDomElements
    }
    function InitResourceDomElements(element) {

        // wire up events for the file upload button

        const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
        elSystemFileUploadBtn.addEventListener("change", function(event) {
            const elFileUploadTxt = document.querySelector(".onsched-wizard.onsched-form .onsched-file-upload-txt");
            if (elSystemFileUploadBtn.value) {
                var uploadedFileName = elSystemFileUploadBtn.value.match( /[\/\\]([\w\d\s\.\-\(\)]+)$/ )[0];
                uploadedFileName = uploadedFileName.replace(/^\\|\\$/g, ''); // remove leading backslash
                elFileUploadTxt.innerHTML = uploadedFileName;
                elFileUploadTxt.dataset.uploadedImage = true;
                var image = document.getElementById("onsched-image-preview");
                image.src = URL.createObjectURL(event.target.files[0]);
                const base64String = OnSchedWizardHelpers.Base64Encoded(image); 
                // save the filename so we can POST the uploadimage later
                elSystemFileUploadBtn.dataset.filename = uploadedFileName;
            }
            else {
                elFileUploadTxt.innerHTML = "No file chosen, yet.";
                elFileUploadTxt.dataset.uploadedImage = false;
            }
        });

        const elFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form .onsched-file-upload-btn");
        elFileUploadBtn.addEventListener("click", function(event) {
            elSystemFileUploadBtn.click();
        });

        // make a rest call to populate the resourceGroup select on the form
        var locationId = element.params.locationId == undefined ? "" : locationId; 
        var urlResourceGroups = element.onsched.setupApiBaseUrl + "/resourcegroups";
        urlResourceGroups = OnSchedHelpers.AddUrlParam(urlResourceGroups, "locationId", locationId);

        element.onsched.accessToken.then(x =>
            OnSchedRest.GetResourceGroups(x, urlResourceGroups, function (response) {
                if (response.error) {
                    console.log("Rest error response code=" + response.code);
                }
                else {
                    console.log(response);
                    var elResourceGroups = document.querySelector(".onsched-wizard.onsched-form select[name=groupId]");
                    elResourceGroups.innerHTML = OnSchedTemplates.resourceGroupOptions(response.data);
                    // template the resourcegroup select
                }
            }) // end rest response
        ); // end promise            
    }
    function InitServiceSetupDomElements(element) {
        
    }
    function GetLocationPostData(formElements) {
        console.log("In GetLocationPostData");
        var businessHours = { 
            sun: { startTime:0, endTime:0 },
            mon: { startTime:0, endTime:0 },
            tue: { startTime:0, endTime:0 },
            wed: { startTime:0, endTime:0 },
            thu: { startTime:0, endTime:0 },
            fri: { startTime:0, endTime:0 },
            sat: { startTime:0, endTime:0 },
        };

        var postData = { address: {}, businessHours: businessHours, settings: {} };
        for (var i = 0; i < formElements.length; i++) {
            var e = formElements[i];
            switch(e.dataset.post) {
                case undefined:
                    // ignore fields without a data-post entry
                    break;
                case "root":
                    // timezoneName, phone and fax require special handling
                    if (e.name == "timezoneName") {
                        postData[e.name] = e.options[e.selectedIndex].dataset.tz;
                    }
                    else
                    if (e.name == "phone" || e.name == "fax") {
                        postData[e.name] = OnSchedHelpers.ParsePhoneNumber(e.value);
                    }
                    else {
                        postData[e.name] = e.value
                    }
                    break;
                case "address":
                    postData.address[e.name] = e.value;
                    break;
                case "settings":
                    postData.settings[e.name] = e.value;
                    break;
                case "businessHours":
                    var bhDay = e.name.substr(0, 3);
                    var bhTime = e.name.substr(3);
                    if (bhTime.includes("Start"))
                        postData.businessHours[bhDay].startTime = e.value;
                    else
                        postData.businessHours[bhDay].endTime = e.value;
//                    postData.businessHours[e.name] = e.value;
                    break;
                default:
                    console.log(e.dataset.post + " " + e.name + " unrecognizable post attribute");
                    break;
            }
        }
        console.log(postData);
        return postData;

    } // End GetLocationPostData

    function GetLocationPutData(formElements) {
        console.log("In GetLocationPutData");
        var businessHours = { 
            sun: { startTime:0, endTime:0 },
            mon: { startTime:0, endTime:0 },
            tue: { startTime:0, endTime:0 },
            wed: { startTime:0, endTime:0 },
            thu: { startTime:0, endTime:0 },
            fri: { startTime:0, endTime:0 },
            sat: { startTime:0, endTime:0 },
        };

        var putData = { address: {}, businessHours: businessHours, settings: {} };
        for (var i = 0; i < formElements.length; i++) {
            var e = formElements[i];
            switch(e.dataset.post) {
                case undefined:
                    // ignore fields without a data-post entry
                    break;
                case "root":
                    // timezoneName, phone and fax require special handling
                    if (e.name == "timezoneName") {
                        putData[e.name] = e.options[e.selectedIndex].dataset.tz;
                    }
                    else
                    if (e.name == "phone" || e.name == "fax") {
                        putData[e.name] = OnSchedHelpers.ParsePhoneNumber(e.value);
                    }
                    else {
                        putData[e.name] = e.value
                    }
                    break;
                case "address":
                    putData.address[e.name] = e.value;
                    break;
                case "settings":
                    putData.settings[e.name] = e.value;
                    break;
                case "businessHours":
                    var bhDay = e.name.substr(0, 3);
                    var bhTime = e.name.substr(3);
                    if (bhTime.includes("Start"))
                        putData.businessHours[bhDay].startTime = e.value;
                    else
                        putData.businessHours[bhDay].endTime = e.value;
//                    putData.businessHours[e.name] = e.value;
                    break;
                default:
                    console.log(e.dataset.post + " " + e.name + " unrecognizable put attribute");
                    break;
            }
        }
        console.log(putData);
        return putData;

    } // End GetLocationPutData

    function GetResourcePostData(formElements, element) {
        try {
            console.log("In GetResourcePostData");
            var businessHours = { 
                sun: { startTime:0, endTime:0 },
                mon: { startTime:0, endTime:0 },
                tue: { startTime:0, endTime:0 },
                wed: { startTime:0, endTime:0 },
                thu: { startTime:0, endTime:0 },
                fri: { startTime:0, endTime:0 },
                sat: { startTime:0, endTime:0 },
            };

            var locationId = element.params.locationId == undefined ? "" : element.params.locationId;

            var postData = { locationId: locationId, address: {}, contact: {}, availability: businessHours, options: {}, customFields: {} };
            for (var i = 0; i < formElements.length; i++) {
                var e = formElements[i];
                switch(e.dataset.post) {
                    case undefined:
                        // ignore fields without a data-post entry
                        break;
                    case "root":
                        // timezoneName, phone and fax require special handling
                        if (e.name == "timezoneName") {
                            postData[e.name] = e.options[e.selectedIndex].dataset.tz;
                        }
                        else {
                            postData[e.name] = e.value
                        }
                        break;
                    case "address":
                        postData.address[e.name] = e.value;
                        break;
                    case "contact":
                        if (e.name == "businessPhone" || e.name == "mobilePhone" || e.name == "homePhone") {
                            postData.contact[e.name] = OnSchedHelpers.ParsePhoneNumber(e.value);
                        }
                        else {
                            postData.contact[e.name] = e.value;
                        }                   
                        break;
                    case "options":
                        postData.options[e.name] = e.value;
                        break;
                    case "businessHours":
                        var bhDay = e.name.substr(0, 3);
                        var bhTime = e.name.substr(3);
                        if (bhTime.includes("Start"))
                            postData.availability[bhDay].startTime = e.value;
                        else
                            postData.availability[bhDay].endTime = e.value;
                        break;
                        case "customFields":
                            postData.options[e.name] = e.value;
                            break;
                        default:
                            console.log(e.dataset.post + " " + e.name + " unrecognizable post attribute");
                        break;
                }
            }
            console.log(postData);
            return postData;

        } catch (e) {
            // TODO - raise error event to the app client
            console.log("GetResourcePostData failed");
            console.log(e);
        }

    }
    function GetResourcePutData(formElements, element) {
        try {

           console.log("In GetResourcePutData");
            var availability = { 
                sun: { startTime:0, endTime:0 },
                mon: { startTime:0, endTime:0 },
                tue: { startTime:0, endTime:0 },
                wed: { startTime:0, endTime:0 },
                thu: { startTime:0, endTime:0 },
                fri: { startTime:0, endTime:0 },
                sat: { startTime:0, endTime:0 },
            };

            var putData = { address: {}, contact: {}, availability: availability, options: {}, customFields: {} };
            for (var i = 0; i < formElements.length; i++) {
                var e = formElements[i];
//                console.log(e.name);
                switch(e.dataset.post) {
                    case undefined:
                        // ignore fields without a data-post entry
                        break;
                    case "root":
                        // timezoneName, phone and fax require special handling
                        if (e.name == "timezoneName") {
                            putData[e.name] = e.options[e.selectedIndex].dataset.tz;
                            console.log("timezoneName="+putData[e.name]);
                        }
                        else {
                            putData[e.name] = e.value
                        }
                        if (e.name == "groupId")
                            putData[e.name] = e.value == 0 ? "" : e.value;

                        break;
                    case "address":
                        putData.address[e.name] = e.value;
                        break;
                    case "contact":
                        if (e.name == "businessPhone" || e.name == "mobilePhone" || e.name == "homePhone") {
                            putData.contact[e.name] = OnSchedHelpers.ParsePhoneNumber(e.value);
                        }
                        else {
                            console.log("putData.contact["+ e.name + "]");
                            putData.contact[e.name] = e.value;
                        }        
                        break;
                    case "options":
                        putData.options[e.name] = e.value;
                        break;
                    case "businessHours":
                        var bhDay = e.name.substr(0, 3);
                        var bhTime = e.name.substr(3);
                        if (bhTime.includes("Start"))
                            putData.availability[bhDay].startTime = e.value;
                        else
                            putData.availability[bhDay].endTime = e.value;
                        break;
                    case "customFields":
                        putData.customFields[e.name] = e.value;
                        break;
                    default:
                        console.log(e.dataset.post + " " + e.name + " unrecognizable put attribute");
                        break;
                }
            }
            console.log(putData);
            return putData;
        } catch (e) {
            // TODO - raise error event to the app client
            console.log("GetResourcePutData failed");
            console.log(e);
        }
    }
    function GetServicePostData(formElements) {

    }
    function GetServicePutData(formElements) {

    }

    function WizardPrevHandler(e) {
        var elStep = document.querySelector(".onsched-wizard input[name=step]")
        var step = parseInt(elStep.value);
        // update the new step value
        step = step - 1;
        elStep.value = step;
        ShowWizardSection(step);
        e.preventDefault();
    }
    function ShowWizardSection(step) {
        // hide all the steps then show current step
        var elWizardSections = document.querySelectorAll(".onsched-wizard .onsched-wizard-section");
        for (var i = 0; i < elWizardSections.length; i++) {
            elWizardSections[i].style.display = "none";
        }
        var stepInt = parseInt(step, 10);
        if (stepInt < 0 || stepInt >= elWizardSections.length) {
            stepInt = 0; // fail safe
            // update value in hidden field
            var elStep = document.querySelector(".onsched-wizard input[name=step]")
            elStep.value = 0;
        }
        var elWizardSection = elWizardSections[stepInt];

        if (stepInt == elWizardSections.length - 1) {
            var elNextButton = document.querySelector(".onsched-wizard-nav .onsched-wizard-nav-buttons .nextButton");
            elNextButton.innerHTML = "Finish";
        }
        else {
            var elNextButton = document.querySelector(".onsched-wizard-nav .onsched-wizard-nav-buttons .nextButton");
            elNextButton.innerHTML = "Next";
        }

        elWizardSection.style.display = "block";
        // remove the active step
        var elActiveStep = document.querySelector(".onsched-wizard-nav-status .active")
        elActiveStep.classList.remove("active");
        // set the new step active
        var elStepIndicators = document.querySelectorAll(".onsched-wizard-nav-status span")
        elStepIndicators[stepInt].classList.add("active");
        var elPrevButton = document.querySelector(".onsched-wizard-nav button.prevButton")
        if (stepInt == 0)
            elPrevButton.style.display = "none";
        else
            elPrevButton.style.display = "inline-block";
    }
    function UpdateBusinessHoursTime(timeCol, action) {
        var labelClosed = timeCol.getElementsByClassName("closed")[0];
        var selectTime = timeCol.getElementsByTagName("select")[0];
        if (action === "closed") {
            labelClosed.style.display = "block";
            if (selectTime.name.includes("Start") || selectTime.name.includes("End"))
                selectTime.value = "0";
        }
        else
            labelClosed.style.display = "none";
        var label24Hrs = timeCol.getElementsByClassName("hrs24")[0];
        if (action === "24hrs") {
            label24Hrs.style.display = "block";
            if (selectTime.name.includes("Start"))
                selectTime.value = "0";        
            if (selectTime.name.includes("End"))
                selectTime.value = "2400";        
        }
        else
            label24Hrs.style.display = "none";
        var selectTime = timeCol.getElementsByClassName("time")[0];
        if (action === "open")
            selectTime.style.display = "block";
        else
            selectTime.style.display = "none";
    }
    function SelectOptionMatchingData(selector, attr, value) {
        Array.from(document.querySelector(selector).options).forEach(function(option) {
            if (option.dataset[attr] == value) {
                // now select this option
                option.selected = true;
            }
        
        });
    }
    function Base64Encoded(img) {
        console.log("base64Encoded="+ img.width + " " + img.height);
        // Create canvas
        const canvas = document.createElement('canvas');
        // Set width and height
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');

        // Draw the image
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataUrl = canvas.toDataURL();
        var n = dataUrl.indexOf("base64,");
        if (n > 0)
            return dataUrl.substr(n+"base64,".length);
        else
            return dataUrl;
     }

    return {
        WizardSubmitHandler: WizardSubmitHandler,
        GetLocationPostData: GetLocationPostData,
        GetLocationPutData: GetLocationPutData,
        WizardPrevHandler: WizardPrevHandler,
        ShowWizardSection: ShowWizardSection,
        UpdateBusinessHoursTime: UpdateBusinessHoursTime,
        InitWizardDomElements: InitWizardDomElements,
        InitLocationDomElements: InitLocationDomElements,
        InitResourceDomElements: InitResourceDomElements,
        InitServiceSetupDomElements: InitServiceSetupDomElements,
        SelectOptionMatchingData: SelectOptionMatchingData,
        Base64Encoded:Base64Encoded,
    };
}();

var OnSchedResponse = function () {

    function GetAvailability(element, response) {
        // TODO: any response error needs to be displayed and captured if not recoverable
        if (response.error) {
            console.log("Response Error: " + response.code);
            return;
        }
        // I need to update the calendar html from the availbleDays info in the response
        // I need to use the FirstAvailableDate in the response if is returned
        var selectedDate = response.firstAvailableDate.length > 0 ?
            OnSchedHelpers.ParseDate(response.firstAvailableDate) :
            OnSchedHelpers.ParseDate(response.startDate);

        var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
        var dateSelectedTitle = selectedDate.toLocaleDateString(
            element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        elDateSelected.title = dateSelectedTitle;
        var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
        elDow.innerHTML = selectedDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
        var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
        elDom.innerHTML = selectedDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });

        var rebuildCalendar = response.availableDays.length > 0;
        if (rebuildCalendar) {
            // Helper function to get the number of displayable calendar days
            var days = OnSchedHelpers.GetCalendarDays(selectedDate);
            // We only take the number of availableDays that we need to populate the calendar, hence the slice.
            var availableDays = response.availableDays.length > days ? response.availableDays.slice(0, days) : response.availableDays;
            var elCalendar = document.querySelector(".onsched-calendar");
            elCalendar.innerHTML = OnSchedTemplates.calendarSelector(availableDays, selectedDate, element.onsched.locale);
        }

        // Business name currently hidden. Leave logic for possible future use
        var elBusinessName = document.querySelector(".onsched-available-times-header .onsched-business-name");
        elBusinessName.innerHTML = response.businessName;

        var elServiceName = document.querySelector(".onsched-available-times-header .onsched-service-name");
        elServiceName.innerHTML = response.serviceName;

        var elServiceDuration = document.querySelector(".onsched-available-times-header .onsched-service-duration");
        var resourceName = response.resourceName;
        var durationAndResource = OnSchedHelpers.FormatDuration(response.serviceDuration);
        if (!OnSchedHelpers.IsEmpty(resourceName))
            durationAndResource += " - " + resourceName;
        elServiceDuration.innerHTML = durationAndResource;

        // Populate the available times list

        var htmlTimes = OnSchedTemplates.availableTimes2(response, selectedDate, element.params.customerId, element.onsched.locale);
        var elTimes = document.querySelector(".onsched-available-times");
        elTimes.innerHTML = htmlTimes;
    }

    function GetLocations(element, response) {
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

    function GetLocation(element, response) {

    }

    function GetServices(element, response) {
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

    function GetService(element, response) {

    }

    function GetResources(element, response) {
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

    function GetResource(element, response) {

    }

    function GetCustomers(element, response) {
        if (response.count == 0) {
            // here is where I may need to do a POST to create the customer
            if (element.params.customerIM != null) {
                url = element.onsched.apiBaseUrl + "/customers";
                element.onsched.accessToken.then(x =>
                    OnSchedRest.PostCustomer(x, url, element.params.customerIM, function (response) {
                        var createCustomerEvent = new CustomEvent("postCustomer", { detail: response });
                        var elCustomer = document.getElementById(element.id);
                        elCustomer.dispatchEvent(createCustomerEvent);
                    })
                );
            }
            else
                throw new Error("Customer not found");
        }
        if (response.count > 0) {
            // fire a custom event here
            var getCustomerEvent = new CustomEvent("getCustomer", { detail: response.data[0] });
            var elCustomer = document.getElementById(element.id);
            elCustomer.dispatchEvent(getCustomerEvent);
        }
    }

    function PostAppointment(element, response) {
        // POST appointment now supports two flows
        // 1. Render a booking form, then do a PUT operation to complete later
        // 2. Complete the booking with the information supplied

        if (OnSchedHelpers.IsEmpty(element.params.completeBooking) || OnSchedHelpers.IsEmpty(element.params.customerId)) {
            // Flow 1 - render the booking flow
            // Render the booking form here
            var elBookingFormContainer = document.querySelector(".onsched-booking-form-container");
            elBookingFormContainer.innerHTML = OnSchedTemplates.bookingForm(response, element.options, element.onsched.locale);
            var elPopup = document.querySelector(".onsched-popup-shadow");
            elPopup.classList.add("is-visible");
            element.timerId = OnSchedHelpers.StartBookingTimer(element.timerId, ".onsched-popup-header .booking-timer");

            var elFormShadow = document.querySelector(".onsched-popup-shadow.is-visible");
            elFormShadow.addEventListener("click", function (event) {
                if (event.target.classList.contains("onsched-close-btn") ||
                    event.target.classList.contains("onsched-popup-shadow") ||
                    event.target.classList.contains("btn-cancel")) {
                    OnSchedOnClick.BookingFormCancel(event, element);
                }
            });

            var elBookingForm = document.querySelector(".onsched-form.booking-form");
            elBookingForm.addEventListener("keyup", e => {
                // if we press the ESC
                if (e.key == "Escape") {
                    OnSchedOnClick.BookingFormCancel(e, element);
                }
            });
            elBookingForm.addEventListener("submit", function (e) {
                e.preventDefault(); // before the code
                OnSchedOnClick.BookingFormSubmit(e, element);
            });
        }
        else {
            // Flow 2 - completed booking with information supplied
            // Fire event to the element to notify of booking complete
            var elAvailability = document.getElementById(element.id);
            var bookingConfirmationEvent = new CustomEvent("bookingConfirmation", { detail: response });
            elAvailability.dispatchEvent(bookingConfirmationEvent);
        }

    }
    function PutAppointmentBook(element, response) {
        var elCloseBtn = document.querySelector(".onsched-close-btn");

        clearInterval(element.timerId);
        if (response.error) {
            if (response.validation) {
                console.log(response.validation);
                console.log(response.code);
                console.log(response.data);
                var errorBoxParams = { code: response.code, message: response.data.error };
                var errorContainer = document.querySelector(".onsched-error-container");
                errorContainer.innerHTML = OnSchedTemplates.errorBox(errorBoxParams);
                elCloseBtn.click(); // simulate click of close button
            }
            else {
                console.log(response.code);
                console.log(response.data);
                elCloseBtn.click(); // simulate click of close button
            }
        }
        else {
            document.querySelector(".onsched-popup-shadow").classList.remove("is-visible");

            // clear out the availbility container
            var elAvailabilityContainer = document.querySelector(".onsched-container.onsched-availability")
            elAvailabilityContainer.innerHTML = "";

            // Need logic here to check if overriding the bookingConfirmation.

            if (element.options.bookingConfirmation != null && element.options.bookingConfirmation.suppressUI) {
                console.log("Suppress UI in BookingConfirmation")
            }
            else {
                var bookingConfirmationHtml = OnSchedTemplates.confirmation(response, element.onsched.locale);
                var elBookingConfirmationContainer = document.querySelector(".onsched-booking-confirmation-container");
                elBookingConfirmationContainer.innerHTML = bookingConfirmationHtml;    
            }

            // fire client event to inform of bookingConfirmation with response data
            var elAvailability = document.getElementById(element.id);
            var bookingConfirmationEvent = new CustomEvent("bookingConfirmation", { detail: response });
            elAvailability.dispatchEvent(bookingConfirmationEvent);
        }
    }
    function PostLocation(element, response) {
        if (response.error) {
            console.log("Rest error response code=" + response.code);
            return;
        }
        console.log("OnSchedResponse.PostLocation");
        console.log(response);
        var elLocationSetup = document.getElementById(element.id);
        var confirmationEvent = new CustomEvent("locationSetupConfirmation", { detail: response });
        elLocationSetup.dispatchEvent(confirmationEvent);    
    }
    function PutLocation(element, response) {
        if (response.error) {
            console.log("Rest error response code=" + response.code);
            console.log(response.data);
            return;
        }
        var elLocationSetup = document.getElementById(element.id);
        var confirmationEvent = new CustomEvent("locationSetupConfirmation", { detail: response });
        elLocationSetup.dispatchEvent(confirmationEvent);    
    }    
    function PostResource(element, response) {
        if (response.error) {
            console.log("Rest error response code=" + response.code);
            return;
        }
        // check if we need to upload an image for this resource
        const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
        if (elSystemFileUploadBtn.value) {

            var image = document.getElementById("onsched-image-preview");
            const base64String = OnSchedWizardHelpers.Base64Encoded(image); 
            console.log(base64String);

            var postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
            console.log(postData);
            const uploadImageUrl = element.onsched.setupApiBaseUrl + "/resources/"+ response.id + "/uploadimage";
            element.onsched.accessToken.then(x =>
                OnSchedRest.PostResourceImage(x, uploadImageUrl, postData, function (response) {
                    if (response.error) {
                        console.log("PostResourceImgae Rest error response code=" + response.code);
                        return;
                    }
                    console.log("PostResourceImgage SUCCESS");
                    console.log(response);
                })
            );        
        }

        console.log("OnSchedResponse.PostResource");
        console.log(response);
        var elResourceSetup = document.getElementById(element.id);
        var confirmationEvent = new CustomEvent("resourceSetupConfirmation", { detail: response });
        elResourceSetup.dispatchEvent(confirmationEvent);    
    }
    function PutResource(element, response) {
        if (response.error) {
            console.log("Rest error response code=" + response.code);
            console.log(response.data);
            return;
        }
        // check if we need to upload an image for this resource
        const elSystemFileUploadBtn = document.querySelector(".onsched-wizard.onsched-form input[name=onsched-system-file-upload]");
        if (elSystemFileUploadBtn.value) {
            var image = document.getElementById("onsched-image-preview");
            const base64String = OnSchedWizardHelpers.Base64Encoded(image); 
            var postData = { imageFileName:elSystemFileUploadBtn.dataset.filename, imageFileData: base64String};
            console.log(postData);
            const uploadImageUrl = element.onsched.setupApiBaseUrl + "/resources/"+ response.id + "/uploadimage";
            element.onsched.accessToken.then(x =>
                OnSchedRest.PostResourceImage(x, uploadImageUrl, postData, function (response) {
                    if (response.error) {
                        console.log("PostResourceImgae Rest error response code=" + response.code);
                        return;
                    }
                    console.log("PostResourceImgage SUCCESS");
                    console.log(response);                
                })
            );                 
        }
        
        console.log("OnSchedResponse.PutResource");
        console.log(response);        
        var elResourceSetup = document.getElementById(element.id);
        var confirmationEvent = new CustomEvent("resourceSetupConfirmation", { detail: response });
        elResourceSetup.dispatchEvent(confirmationEvent);    
    }    

    return {
        GetAvailability: GetAvailability,
        GetLocations: GetLocations,
        GetLocation: GetLocation,
        GetServices: GetServices,
        GetService: GetService,
        GetResources: GetResources,
        GetResource: GetResource,
        GetCustomers: GetCustomers,
        PostAppointment: PostAppointment,
        PutAppointmentBook: PutAppointmentBook,
        PostLocation: PostLocation,
        PutLocation: PutLocation,
        PostResource: PostResource,
        PutResource: PutResource,
    };
}(); // End OnSchedResponse

///
///     OnSchedOnChange
///     Element processing for change events
///
var OnSchedOnChange = function () {

    function OnChangeTimezone(event, element) {
        var el = event.target;
        var tzOffset = event.target.options[el.selectedIndex].value;
        element.params["tzOffset"] = tzOffset;
        var elSelectedDate = document.querySelector(".onsched-calendar .day.selected");
        var selectedDate = OnSchedHelpers.ParseDate(elSelectedDate.dataset.date);
        var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, selectedDate);
        var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
        var dateSelectedTitle = selectedDate.toLocaleDateString(
            element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        elDateSelected.title = dateSelectedTitle;
        OnSchedHelpers.ShowProgress();

        element.onsched.accessToken.then(x =>
            OnSchedRest.GetAvailability(x, url, function (response) {
                OnSchedResponse.GetAvailability(element, response);
            })
        );
    }
    return {
        OnChangeTimezone: OnChangeTimezone
    };
}();

///
///     OnSchedOnClick
///     Element processing for click handling
///

var OnSchedOnClick = function () {

    function CalendarDay(event, element) {
        var dayClicked = event.target;
        // implement logic here to switch the selection in UI and trigger availability call
        var calendarDays = document.querySelectorAll(".onsched-calendar-rowgroup .day");
        [].forEach.call(calendarDays, function (el) {
            el.className = el.className.replace(/\bselected\b/g, ""); // unselect all calendar days in UI
            // el.classList.remove("selected"); above method more browser friendly
        });

        // call logic to select day with the clicked element
        if (dayClicked.classList.contains("selected"))
            console.log("already selected");
        else
            dayClicked.classList.add("selected");

        var title = document.querySelector(".onsched-calendar-header .onsched-calendar-title");
        var clickedDate = OnSchedHelpers.ParseDate(dayClicked.dataset.date);
        var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, clickedDate);
        if (clickedDate.getMonth() != title.dataset.month || clickedDate.getFullYear() != title.dataset.year) {
            var calendarHtml = OnSchedTemplates.calendarSelectorFromDate(clickedDate, element.onsched.locale);
            var elCalendar = document.querySelector(".onsched-calendar");
            elCalendar.innerHTML = calendarHtml;

            // calculate available days to pull when mounting
            url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
                OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(clickedDate)));
            url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", OnSchedHelpers.GetCalendarDays(clickedDate));
        }

        var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
        elDow.innerHTML = clickedDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
        var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
        elDom.innerHTML = clickedDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });
        var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
        var dateSelectedTitle = clickedDate.toLocaleDateString(
            element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        elDateSelected.title = dateSelectedTitle;

        OnSchedHelpers.ShowProgress();
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetAvailability(x, url, function (response) {
                OnSchedResponse.GetAvailability(element, response);
            })
        );
    }


    function AvailableTime(event, element) {

        var timeClicked = event.target;
        element.timerId = null;
        var postData = new Object();
        postData.locationId = element.params.locationId;
        postData.serviceId = "" + element.params.serviceId;
        postData.resourceId = "" + timeClicked.dataset.resourceid;
        postData.startDateTime = timeClicked.dataset.startdatetime;
        postData.endDateTime = timeClicked.dataset.enddatetime;
        if (OnSchedHelpers.IsEmpty(element.params.customerId) === false)
            postData.customerId = element.params.customerId;

        OnSchedHelpers.ShowProgress();
        // Invoke POST /appointments endpoint
        var appointmentsUrl = element.onsched.apiBaseUrl + "/appointments";
        if (OnSchedHelpers.IsNotEmpty(element.params.completeBooking) &&
            OnSchedHelpers.IsNotEmpty(element.params.customerId)) {
            appointmentsUrl = OnSchedHelpers.AddUrlParam(appointmentsUrl, "completeBooking", element.params.completeBooking);
        }

        // TWO DIFFERENT FLOWS ARE POSSIBLE
        // 1. Render the booking form
        // 2. Complete the booking, with supplied information


        element.onsched.accessToken.then(x =>
            OnSchedRest.PostAppointment(x, appointmentsUrl, postData, function (response) {
                OnSchedResponse.PostAppointment(element, response);
            })
        );
    }

    function BookingFormCancel(event, element) {
        document.querySelector(".onsched-popup-shadow").classList.remove("is-visible");
        var id = document.querySelector(".onsched-form.booking-form input[name=id]").value;
        var appointmentsUrl = element.onsched.apiBaseUrl + "/appointments/" + id;
        clearInterval(element.timerId);
        element.onsched.accessToken.then(x =>
            OnSchedRest.DeleteAppointment(x, appointmentsUrl, function (response) {
//                console.log("Initial Appointment Deleted");
            }));
    }

    function BookingFormSubmit(event, element) {
        var appointmentBM = {};
        var appointmentBookingFields = [];
        var customerBookingFields = [];
        var lastname, firstname;
        var form = document.querySelector(".onsched-form.booking-form");

        for (var i = 0; i < form.elements.length; i++) {
            var e = form.elements[i];
            if (OnSchedHelpers.IsEmpty(e.name))
                continue;
            if (e.type === "hidden")
                continue;
            if (e.name === "name")
                appointmentBM[e.name] = e.value;
            else
            if (e.name === "firstname")
                firstname = e.value;
            else
            if (e.name === "lastname")
                lastname = e.value;
            else {
                // need to handle booking fields different than other form fields
                if (e.dataset.bookingfield == "appointment" || e.dataset.bookingfield == "customer") {
                    var bookingField = {};        
                    bookingField["name"] = e.name;
                    bookingField["value"] = e.value;  
                    if (e.dataset.bookingfield == "appointment")
                        appointmentBookingFields.push(bookingField);
                    else
                        customerBookingFields.push(bookingField);
                }
                else
                    appointmentBM[e.name] = e.value;
            }
        }

        var name = "";
        if (OnSchedHelpers.IsEmpty(firstname) === false)
            name = firstname + " ";
        if (OnSchedHelpers.IsEmpty(lastname) === false)
            name += lastname;
        if (OnSchedHelpers.IsEmpty(name) === false)
            appointmentBM["name"] = name;

        appointmentBM.appointmentBookingFields = appointmentBookingFields;
        appointmentBM.customerBookingFields = customerBookingFields;

        if (element.params.appointmentBM != null) {
            console.log(element.params.appointmentBM);
            appointmentBM.customFields = element.params.appointmentBM.customFields;
        }

        var id = document.querySelector(".onsched-form.booking-form input[name=id]").value;
        var url = element.onsched.apiBaseUrl + "/appointments/" + id + "/book";

        element.onsched.accessToken.then(x =>
            OnSchedRest.PutAppointmentBook(x, url, appointmentBM, function (response) {
                OnSchedResponse.PutAppointmentBook(element, response);
            }));
    }


    function MonthPrev(event, element) {

        event.target.disabled = true;

        var firstDayDate = OnSchedHelpers.ParseDate(event.target.dataset.firstday);
        var prevDate = OnSchedHelpers.AddDaysToDate(firstDayDate, -1);
        prevDate = OnSchedHelpers.FirstDayOfMonth(prevDate);


        var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, prevDate);

        var calendarHtml = OnSchedTemplates.calendarSelectorFromDate(prevDate, element.onsched.locale);
        var elCalendar = document.querySelector(".onsched-calendar");
        elCalendar.innerHTML = calendarHtml;
        // calculate available days to pull when mounting
        url = OnSchedHelpers.AddUrlParam(url, "dayAvailabilityStartDate",
            OnSchedHelpers.CreateDateString(OnSchedHelpers.GetFirstCalendarDate(prevDate)));
        url = OnSchedHelpers.AddUrlParam(url, "dayAvailability", OnSchedHelpers.GetCalendarDays(prevDate));
        url = OnSchedHelpers.AddUrlParam(url, "firstDayAvailable", "true");
        var elTimes = document.querySelector(".onsched-available-times");
        elTimes.innerHTML = "";

        var elDow = document.querySelector(".onsched-available-times-header .date-selected .dow");
        elDow.innerHTML = prevDate.toLocaleDateString(element.onsched.locale, { weekday: 'short' });
        var elDom = document.querySelector(".onsched-available-times-header .date-selected .dom");
        elDom.innerHTML = prevDate.toLocaleDateString(element.onsched.locale, { day: 'numeric' });
        var elDateSelected = document.querySelector(".onsched-available-times-header .date-selected");
        var dateSelectedTitle = prevDate.toLocaleDateString(
            element.onsched.locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        elDateSelected.title = dateSelectedTitle;

        OnSchedHelpers.ShowProgress();
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetAvailability(x, url, function (response) {
                OnSchedResponse.GetAvailability(element, response);
            })
        );
    }

    function MonthNext(event, element) {

        event.target.disabled = true;

        var lastDayDate = OnSchedHelpers.ParseDate(event.target.dataset.lastday);
        var nextDate = OnSchedHelpers.AddDaysToDate(lastDayDate, 1);
        var url = OnSchedHelpers.CreateAvailabilityUrl(element.onsched.apiBaseUrl, element.params, nextDate);

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
//        dateSelectedTitle += " " + nextDate.toTimeString();
        elDateSelected.title = dateSelectedTitle;

        OnSchedHelpers.ShowProgress();
        element.onsched.accessToken.then(x =>
            OnSchedRest.GetAvailability(x, url, function (response) {
                OnSchedResponse.GetAvailability(element, response);
            })
        );
    }

    function ListItem(event, element) {
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
    }
    return {
        CalendarDay: CalendarDay,
        BookingFormSubmit: BookingFormSubmit,
        BookingFormCancel: BookingFormCancel,
        AvailableTime: AvailableTime,
        MonthPrev: MonthPrev,
        MonthNext: MonthNext,
        ListItem: ListItem
    };
}();

///
///     OnSchedHelpers
///     Misc helper functions used in various element processing
///

var OnSchedHelpers = function () {

    function IsEmpty(val) {
        return (val === undefined || val == null || val.length <= 0) ? true : false;
    }
    function IsNotEmpty(val) {
        return (val === undefined || val == null || val.length <= 0) ? false : true;
    }
    function GetFunctionName(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }

    function GetUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    function CreateAvailabilityUrl(baseUrl, params, date, tzOffset) {
        var startDate = date == null ? params.date : date;
        var endDate = date == null ? params.date : date;
        var url = baseUrl;
        url += "/" + "availability";
        url += "/" + params.serviceId;
        url += "/" + CreateDateString(startDate);
        url += "/" + CreateDateString(endDate);

        url = OnSchedHelpers.IsEmpty(params.locationId) ? url : AddUrlParam(url, "locationId", params.locationId);
        url = OnSchedHelpers.IsEmpty(params.tzOffset) ? url : AddUrlParam(url, "tzOffset", params.tzOffset);
        url = OnSchedHelpers.IsEmpty(params.resourceId) ? url : AddUrlParam(url, "resourceId", params.resourceId);
        return url;
    }
    function AddUrlParam(url, name, value) {
        if (value == undefined)
            return url;
        if (url.indexOf("?") !== -1)
            url += "&" + name + "=" + value;
        else
            url += "?" + name + "=" + value;
        return url;
    }
    function ParseDate(dateString) {
        var utcDate = new Date(Date.parse(dateString));
        var date = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        return date;
    }
    function CreateDateString(date) {
        var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        return dateString;
    }

    function FirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    function LastDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    function AddDaysToDate(inputDate, days) {
        var date = new Date(inputDate);
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        return date;
    }
    function GetFirstCalendarDate(date) {
        // first get the beginning of month
        // then go backwards to sunday
        var firstDayOfMonth = FirstDayOfMonth(date);
        var dow = firstDayOfMonth.getDay();
        var weekStartDate = AddDaysToDate(firstDayOfMonth, -dow);
        return weekStartDate;
    }
    function GetCalendarDays(date) {
        var totalCalendarWeeks = GetCalendarWeeks(date);
        return totalCalendarWeeks * 7;
    }
    function GetCalendarWeeks(date) {
        var firstDay = FirstDayOfMonth(date);
        var lastDay = LastDayOfMonth(date);

        var dow = firstDay.getDay();
        var displayableMonthDaysWeekOne = 7 - dow;
        var remainingDisplayableDays = lastDay.getDate() - displayableMonthDaysWeekOne;
        var remainingDisplayableWeeks = Math.floor(remainingDisplayableDays / 7) + (remainingDisplayableDays % 7 > 0 ? 1 : 0);
        var totalDisplayableWeeks = remainingDisplayableWeeks + 1;
        return totalDisplayableWeeks;
    }
    function ShowProgress() {
        // clear out any errors that are currently displayed
        var errorContainer = document.querySelector(".onsched-error-container");
        if (errorContainer != null)
            errorContainer.innerHTML = "";
        var indicators = document.getElementsByClassName("onsched-progress");
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].style.display = "block";
        }
    }
    function HideProgress() {
        var indicators = document.getElementsByClassName("onsched-progress");
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].style.display = "none";
        }
    }
    function FormatServiceDescription(response) {
        var result = response.serviceName;
        result += " ";
        result += FormatDuration(response.serviceDuration);
        if (response.resourceName.length > 0)
            result += " - " + response.resourceName;
        return result;
    }
    function FormatTime(time) {
        if (time == null)
            return "";
        var hour = Math.floor(time / 100);
        var min = time % 100;
        var ampm = hour >= 12 ? "pm" : "am";
        hour = hour > 12 ? hour - 12 : hour;
        var minsString = min.toString();
        minsString = minsString.length < 2 ? minsString + "0" : minsString;
        //        var fmtTime = String.format("{0}:{1} {2}", hour, minsString, ampm);
        var fmtTime = hour + ":" + minsString + " " + ampm;
        return fmtTime;
    }
    function FormatDuration(duration) {
        var formatted = "none";
        if (duration === null)
            return formatted;

        if (duration <= 0)
            return formatted;
        else
            if (duration > 90 && duration % 60 > 0)
                formatted = duration / 60 + " hours" + duration % 60 + " min";
            else if (duration > 90)
                formatted = duration / 60 + " hours";
            else
                formatted = duration + " min";

        return formatted;
    }
    function StartBookingTimer(timerId, timerSelector, timerSecs) {
        try {
            // Initialize here before timer kicks in
            if (OnSchedHelpers.IsEmpty(timerId) === false) {
                clearInterval(timerId);
                timerId = null;
            }
            // default to 2 mins
            timerSecs = timerSecs == null ? 120 : timerSecs;
            var today = new Date(); 
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(timerSecs);
            today.setMilliseconds(0);

            var options = { minute: "2-digit", second:"2-digit" };  
            var timerText = today.toLocaleTimeString("en-us", options);
            timerText += today.getMinutes() > 0 ? " mins" : " secs";
            if (today.getMinutes() > 0)
                timerText = timerText.replace(/^0+/, "");
            var elBookingTimer = document.querySelector(timerSelector);
            elBookingTimer.innerHTML = timerText;
            timerId = setInterval(
                function () {
                    var mins = today.getMinutes();
                    var secs = today.getSeconds();
                    var elBookingTimer = document.querySelector(timerSelector);
                    var timerText = today.toLocaleTimeString("en-us", { minute: "2-digit", second: "2-digit" });
                    timerText += today.getMinutes() > 0 ? " mins" : " secs";
                    if (today.getMinutes() > 0)
                        timerText = timerText.replace(/^0+/, "");
                    elBookingTimer.innerHTML = timerText;
                    mins = today.getMinutes();
                    secs = today.getSeconds() - 1;
                    today.setMinutes(secs > 60 ? mins - 1 : mins);
                    today.setSeconds(secs > 60 ? 0 : secs);
                    if (mins === 0 && secs === 0) {
                        clearInterval(timerId);
                        var elCloseBtn = document.querySelector(".onsched-close-btn");
                        elCloseBtn.click();
                    }
                }, 1000);
            return timerId;
        } catch (e) {
            console.log("OnSchedHelpers.StartBookingTimer failed " + e.message);
//            OnSchedule.LogException(filename, "StartBookingTimer", e);
        }
    } // StartBookingTimer

    async function SetToken(token) {
        return token;
    }

    function FormatPhoneNumber(ns) {
        var formatted = "";
        if (ns == undefined)
            return formatted;
        else
        if (ns.length == 10)
            formatted =  "(" + ns.substr(0, 3) + ")" + " " + ns.substr(3, 3) + "-" + ns.substr(6);
        else
        if (ns.length > 10)
            formatted = "+" + ns.substr(0, 2)+ " " + ns.substr(2, 3) + " " + ns.substr(5);
        else
            formatted = ns;
        return formatted;
    }
    function ParsePhoneNumber(strIn) {
        if (strIn == undefined)
            return "";
        strIn = strIn.trim();

        var parsed = strIn.replace(/[^0-9]/g, '');
                    
        return parsed.trim();
    }

    return {
        IsEmpty: IsEmpty,
        IsNotEmpty: IsNotEmpty,
        GetFunctionName: GetFunctionName,
        GetUrlParameter: GetUrlParameter,
        CreateAvailabilityUrl: CreateAvailabilityUrl,
        AddUrlParam: AddUrlParam,
        ParseDate: ParseDate,
        CreateDateString: CreateDateString,
        GetFirstCalendarDate: GetFirstCalendarDate,
        GetCalendarDays: GetCalendarDays,
        GetCalendarWeeks: GetCalendarWeeks,
        FirstDayOfMonth: FirstDayOfMonth,
        LastDayOfMonth: LastDayOfMonth,
        AddDaysToDate: AddDaysToDate,
        ShowProgress: ShowProgress,
        HideProgress: HideProgress,
        FormatServiceDescription: FormatServiceDescription,
        FormatTime: FormatTime,
        FormatDuration: FormatDuration,
        StartBookingTimer: StartBookingTimer,
        SetToken: SetToken,
        FormatPhoneNumber:FormatPhoneNumber,
        ParsePhoneNumber:ParsePhoneNumber,
    };

}(); // End OnSchedHelpers

// Create an object to return templates

var OnSchedTemplates = function () {
    function availabilityContainer() {
        const markup = `
    <div class="onsched-container onsched-availability">
        <div class="onsched-error-container"></div>
        <div class="onsched-row">
            <div class="onsched-col">
                <div class="onsched-business-name" style="display:none">&nbsp;</div>
                <div class="onsched-available-times-header">
                    <div class="date-selected">
                        <div class="dow">Tue</div>
                        <div class="dom">24</div>
                    </div>
                    <div>
                        <div class="onsched-business-name" style="display:none">&nbsp;</div>
                        <div class="onsched-calendar-prompt" style="">Select a Date & Time</div>
                        <div class="onsched-service-name"></div>
                        <div class="onsched-service-duration">30 min</div>
                        <div class="onsched-service-description" style="display:none">General assessment of patient for Hypertension</div>
                    </div>
                </div>
                <div class="onsched-calendar"></div>
                <div class="onsched-timezone">
                    <select class="onsched-select timezone">
                        ${TimezoneSelectOptions(Timezones())}
                    </select>
                </div>
            </div>
            <div class="onsched-col">
                <div class="onsched-available-times"></div>
            </div>
        </div>
        <div class="onsched-booking-form-container"></div>
    </div>
    <div class="onsched-booking-confirmation-container"></div>
            `;
        return markup;
    }

    function timesContainer(availableTimes, locationId, customerId, locale) {

        locationId = OnSchedHelpers.IsEmpty(locationId) ? "" : locationId;
        customerId = OnSchedHelpers.IsEmpty(customerId) ? "" : customerId;

        const timesHtml = `
            <div class="time-container">
                ${availableTimes.map((availableTime, index) =>
                `<a href="#" class="time onsched-chip hoverable"
                    data-locationId="${locationId}"
                    data-customerId="${customerId}"
                    data-startDateTime="${availableTime.startDateTime}"
                    data-endDateTime="${availableTime.endDateTime}"
                    data-resourceId="${availableTime.resourceId}"
                    data-date="${availableTime.date}"
                    data-time="${availableTime.time}"
                    data-duration="${availableTime.duration}"
                    data-slots="${availableTime.availableBookings}"
                    title="Click to book now. ${availableTime.availableBookings} remaining"
                    >
                    ${timeFromMilitaryTime(availableTime.time, locale)}
                 </a>`
            ).join("")}
            </div>
        `;
        return timesHtml;
    }

    function weeklyDateSelector(date) {
        var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

        // Here I need the logic to build out the weekdays
        // First from the date passed in figure out the day of the week
        var selectedDate = new Date(date);
        var workingDate = new Date(date);
        var dow = date.getDay();
        var weekStartDate = AddDaysToDate(workingDate, -dow);
        var week = [];
        var weekDayDate = weekStartDate;
        for (i = 0; i < 7; i++) {
            weekDayDate = AddDaysToDate(weekStartDate, i);
            week.push(weekDayDate);
        }

        var dayOptions = { weekday: 'short' };

        const htmlWeekdaySelector = `
            <div class="onsched-weekday-selector">
                <table cellpadding="0" cellspacing="0" role="grid">
                    <tbody>
                        <tr>
                        ${week.map((date, index) =>
                `<td aria-selected="true" data-day="${date.getDay()}" class="${DatesAreEqual(selectedDate, date) ? 'selected' : ''}">
                                <button data-day="${date.getDay()}" data-date="${date}" class="datepicker-day-button" class="waves-effect">
                                    ${week[index].toLocaleDateString("en-US", dayOptions)}</button>
                            </td>`
            ).join("")}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        const htmlDatePicker = `
        <div class="onsched-datepicker-week">
            <div class="onsched-week-selector" role="heading" aria-live="assertive">
                <button class="week-prev" type="button" disabled="disabled" title="Previous week">
                    <span class="chevron">&#10094;</span>
                </button>
                <div class="date-selected">${date.toLocaleDateString("en-US", options)}</div>
                <button class="week-next" type="button" title="Next week">
                    <span class="chevron">&#10095;</span>
                </button>
            </div>
            ${htmlWeekdaySelector}
        </div>
        `;

        html = htmlDatePicker;

        return html;
    }

    function availableTimes2(availability, selectedDate, customerId, locale) {

        const htmlNoAvailableTimes = `
            <div class="onsched-no-available-times">
                <p>
                    <i class="fa fa-info-circle" style="margin-right:4px;font-size:14px;color:#333;"></i>
                    No times available on this date
                </p>
            </div>
        `;

        if (availability.availableTimes.length == 0)
            return htmlNoAvailableTimes;

        var locationId = availability.locationId;

        // bust up times into morning, afternoon and evening
        var morning = []; // < 1200
        var afternoon = []; // 1200 to 1800
        var evening = []; // > 1800 

        for (var i = 0; i < availability.availableTimes.length; i++) {
            if (availability.availableTimes[i].time < 1200)
                morning.push(availability.availableTimes[i]);
            if (availability.availableTimes[i].time >= 1200 && availability.availableTimes[i].time < 1800)
                afternoon.push(availability.availableTimes[i]);
            if (availability.availableTimes[i].time > 1800)
                evening.push(availability.availableTimes[i]);
        }

        // Display Table of Morning, Afternoon and Evening Times
        // NOTE - any one of these could be empty
        // HOW DO I TEMPLATE THIS?
        // Conditionally generate rows for morning, afternoon, and evening

        const htmlMorningRows = `
                <tr><th>Morning</th></tr>
                <tr><td>${timesContainer(morning, availability.locationId, customerId, locale)}</td></tr>
        `;
        const htmlAfternoonRows = `
                <tr><th>Afternoon</th></tr>
                <tr><td>${timesContainer(afternoon, availability.locationId, customerId, locale)}</td></tr>
        `;
        const htmlEveningRows = `
                <tr><th>Evening</th></tr>
                <tr><td>${timesContainer(evening, availability.locationId, customerId, locale)}</td></tr>
        `;

        const html = `
            <table class="onsched-table">
                ${morning.length > 0 ? htmlMorningRows : ''}
                ${afternoon.length > 0 ? htmlAfternoonRows : ''}
                ${evening.length > 0 ? htmlEveningRows : ''}
            </table>
        `;

        return html;
    }

    function availableTimes(response) {

        const timesHtml = `
            <div class="onsched-time-container">
                ${response.availableTimes.map((availableTime, index) =>
                `<a href="#" class="time">
                    <div class="onsched-chip hoverable">
                        ${timeFromDisplayTime(availableTime.displayTime)} <span class="ampm">${ampmFromDisplayTime(availableTime.displayTime)}</span>
                    </div>
                </a>`
            ).join("")}
            </div>
        `;
        return timesHtml;
    }

    function calendarSelectorFromDate(date, locale) {
        // For a quick render of the calendar
        // we build day availability from the date
        var availableDays = availableDaysFromDate(date);
        return calendarSelector(availableDays, date, locale);
    }
    function calendarSelector(availableDays, date, locale) {

        var options = { year: 'numeric', month: 'long' };

        var monthWeeks = getAvailableMonthWeeks(availableDays, date);

        const tmplCalendarHeader = `

            <div class="onsched-calendar-header">
                <div class="onsched-calendar-title" data-month="${date.getMonth()}" data-year="${date.getFullYear()}">
                    ${date.toLocaleDateString(locale, options)}
                </div>
                <div class="onsched-progress-container">
                    <div class="onsched-progress">
                        <div class="indeterminate"></div>
                    </div>
                </div>
                <div style="display:inline-flex;margin-right:6px;">
                    <button class="month-prev" type="button" ${getDisabledMonthPrev(availableDays)} 
                        title="Previous month" style="padding: 0 8px;" data-firstDay="${availableDays[0].date}">
                        &#10094;
                    </button>
                    <div style="width:20px;"></div>
                    <button class="month-next" type="button" ${getDisabledMonthNext(availableDays)} 
                        title="Next month" style="padding: 0 8px;" data-lastDay="${availableDays[availableDays.length - 1].date}">
                        &#10095;
                    </button>
                </div>
            </div>
        `;

        var weekdayDate = new Date(2020, 3-1, 1, 0, 0, 0); 

        const tmplCalendarWeekDayRow = `
            <div class="onsched-calendar-row onsched-weekdays">
                <div class="onsched-calendar-col dow" title="${weekdayDate.toLocaleDateString(locale,  {weekday: "long"})}">
                    ${weekdayDate.toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 1).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 1).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 2).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 2).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 3).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 3).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 4).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 4).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 5).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 5).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
                <div class="onsched-calendar-col dow" title="${AddDaysToDate(weekdayDate, 6).toLocaleDateString(locale,  {weekday: "long"})}">
                    ${AddDaysToDate(weekdayDate, 6).toLocaleDateString(locale,  {weekday: "short"})}
                </div>
            </div>
        `;

        const tmplCalendarWeekRow = days => `
        <div class="onsched-calendar-row">
        ${days.map(day => `
            <div class="onsched-calendar-col">
                <button class="day ${IsSelected(day, date)}" data-date="${day.date}" ${IsAvailable(day)} title="${day.reason}">${ParseDate(day.date).getDate()}</button>
            </div>
        `).join('')}
        </div>
        `;
        const tmplCalendarGrid = weeks => `
        <div class="onsched-calendar-grid">
        ${tmplCalendarWeekDayRow}
            <div class="onsched-calendar-rowgroup">
            ${weeks.map(week => `
                ${tmplCalendarWeekRow(week)}
            `).join('')}        
            </div>
        </div>
        `;

        const tmplCalendar = `
            ${tmplCalendarHeader}
            ${tmplCalendarGrid(monthWeeks)}
        `;

        return tmplCalendar;
    }

    function locationsList(response) {
        const tmplLocations = `
            <div class="onsched-container">
                <div class="onsched-row">
                    <div class="onsched-col">
                        <div class="onsched-list">
                            <div class="onsched-table">
                                ${response.data.map((location, index) =>
                `<div class="row">
                                        <div class="icon-col">
                                            <div class="onsched-circle-icon">${getLettersForIcon(location.name)}</div>
                                        </div>
                                        <div class="info-col">
                                            <a href="#" class="list-item name" data-id=${location.id} data-element="locations" 
                                                title="Click to book at this location">${location.name}
                                            </a>
                                            <div class="list-item-description">${location.address.addressLine1}</div>
                                            <div class="list-item-distance">
                                                ${location.travel != null && location.travel.distance != null ?
                    location.travel.distance : ""}
                                            </div>
                                        </div>
                                     </div>`
            ).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return tmplLocations;
    }

    function servicesList(response) {
        const tmplServices = `
            <div class="onsched-container">
                <div class="onsched-row">
                    <div class="onsched-col">
                        <div class="onsched-list">
                            <div class="onsched-table">
                                ${response.data.map((service, index) =>
                `<div class="row">
                                        <div class="icon-col">
                                            <div class="onsched-circle-icon">${getLettersForIcon(service.name)}</div>
                                        </div>
                                        <div class="info-col">
                                            <a href="#" class="list-item name" data-id=${service.id} data-element="services" 
                                                title="Click to book this service">${service.name}
                                            </a>
                                            <div class="list-item-description">${service.description}</div>
                                        </div>
                                     </div>`
            ).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return tmplServices;
    }

    function resourcesList(response) {
        const tmplResources = `
            <div class="onsched-container">
                <div class="onsched-row">
                    <div class="onsched-col">
                        <div class="onsched-list">
                            <div class="onsched-table">
                                ${response.data.map((resource, index) =>
                `<div class="row">
                                        <div class="icon-col">
                                            <div class="onsched-circle-icon">${getLettersForIcon(resource.name)}</div>
                                        </div>
                                        <div class="info-col">
                                            <a href="#" class="list-item name" data-id=${resource.id} data-element="resources" 
                                                title="Click to book this service">
                                                ${resource.name}
                                            </a>
                                            <div class="list-item-description">${resource.description}</div>
                                        </div>
                                     </div>`
            ).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return tmplResources;
    }

    function searchForm(params) {
        const tmplSearchForm = `
            <div class="onsched-container">
                <div class="onsched-row">
                    <div class="onsched-col">
                        <form class="onsched-search-form" method="get">
                            <div class="onsched-search-wrapper">
                            <input name="searchText" value="${params.searchText}" size="50" type="text" placeholder="${params.placeholder}" />
                            <input type="submit" value=" " title="Click to search" />
                            </div>
                            <p>${params.message}</p>
                        <div>
                        <div class="onsched-progress-container" style=width:100%;height:8px;">
                            <div class="onsched-progress">
                                <div class="indeterminate"></div>
                            </div>
                        </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        return tmplSearchForm;
    }

    function errorBox(params) {
        const tmplErrorBox = `
            <div class="onsched-alert error">
                <button class="close" data-dismiss="onsched-alert" aria-hidden="true">x</button>
                <h4>Application Error<span>${params.code}</span></h4>
                <p>${params.message}</p>
            </div>
        `;
        return tmplErrorBox;
    }
    // Create booking fields from POST appointment response
    function bookingFields(data, type) {
        const tmplBookingFields = `
        ${ data.map((item, index) =>
            bookingField(item, type)
            
        ).join("")}
        `;
        return tmplBookingFields;
    }
    // Prob need separate functions for input,select, checkbox etc
    function bookingField(data, type) {

        const tmplBookingField = `
            <div class="onsched-form-row">
                <div class="onsched-form-col">
                    ${data.fieldListItems.length > 0 ? selectField(data, type) : inputField(data, type)}
                </div>
            </div>
        `;
        return tmplBookingField;
    }
    function bookingFieldControl(data) {

    }
    function inputField(data, type) {
        const tmplInputField = `
            <label for="${data.fieldName}">${data.fieldLabel}</label>
            <input type="text" id="${data.fieldName}" name="${data.fieldName}" ${data.fieldRequired ? "required" : ""} ${sizeAttribute(data.fieldLength)} ${bookingFieldDataAttribute(type)} />
        `;
        return tmplInputField;
    }
    function sizeAttribute(length) {
        if (length > 0)
            return "maxlength="+length;
        else
            return "";
    }
    function bookingFieldDataAttribute(type) {
        if (type == "appointment" || type == "customer")
            return "data-bookingfield=" + '"'+type+'"';
        else
            return "";
    }
    function selectField(data, type) {

        const tmplSelectField = `
        <label for="${data.fieldName}">${data.fieldLabel}</label>
        <select id="${data.fieldName}" name="${data.fieldName}" ${data.fieldRequired ? "required" : ""}  ${bookingFieldDataAttribute(type)}>

        ${ data.fieldListItems.map((item, index) =>
                `<option value="${item.value}">${item.name}</option>
                `
            ).join("")}
            </select>
        `;
        return tmplSelectField;
    }
    function checkboxField(data) {
        const tmplCheckboxField = `
            <div class="onsched-checkbox">
                <input type="checkbox" id="${data.fieldName}" name="${data.fieldName}" ${data.required ? "required" : ""} />
                <label for="${data.fieldName}">${data.fieldLabel}</label>
            </div>
        `;
        return tmplCheckboxField;
    }
    function privacyFields(options) {
        if (options.privacyFields == null)
            return "";
        if (options.privacyFields.checkboxLabel == null)
            return privacyFieldsLinkOnly(options);
        if (options.privacyFields.formRows > 1)
            return privacyFieldsTwoRows(options);
        const tmplPrivacyFields = `
        <div class="onsched-form-row">
            <div class="onsched-form-col">
                <label for="acceptPrivacyTerms"><input id="acceptPrivacyTerms" type="checkbox" required>${options.privacyFields.checkboxLabel}</label>
            </div>
            <div class="onsched-form-col">
                <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                    ${options.privacyFields.linkText}
                </a>
            </div>
        </div>
        `;
        return tmplPrivacyFields;
    }
    function privacyFieldsTwoRows(options) {
        const tmplPrivacyFields = `
        <div class="onsched-form-row">
            <div class="onsched-form-col">
                <label for="acceptPrivacyTerms"><input id="acceptPrivacyTerms" type="checkbox" required>${options.privacyFields.checkboxLabel}</label>
            </div>
        </div>
        <div class="onsched-form-row">
            <div class="onsched-form-col">
                <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                    ${options.privacyFields.linkText}
                </a>
            </div>
        </div>
            `;
        return tmplPrivacyFields;        
    }
    function privacyFieldsLinkOnly(options) {
        if (options.privacyFields == null)
            return "";
        const tmplPrivacyFields = `
        <div class="onsched-form-row">
            <div class="onsched-form-col">
                <a href="${options.privacyFields.linkUrl}" target="_blank" title="${options.privacyFields.linkTitle}">
                    ${options.privacyFields.linkText}
                </a>
            </div>
        </div>
        `;
        return tmplPrivacyFields;
    }    
    function bookingForm(response, options, locale) {
        var date = OnSchedHelpers.ParseDate(response.dateInternational);
        var bookingDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var bookingDate = date.toLocaleString(locale, bookingDateOptions);

        const tmplBookingForm = `
    <div class="onsched-popup-shadow" data-animation="zoomInOut">
        <div class="onsched-popup">
            <header class="onsched-popup-header">
                <i class="fa fa-clock" style="margin-right:8px;font-size:18px;color:#1a73e8;"></i>
                <span class="booking-timer">2:00 mins</span>&nbsp;to complete booking
                <a href="#" class="onsched-close-btn" title="Close" aria-label="close modal" data-close></a>
            </header>
            <section class="onsched-booking-summary">
                <h4>${response.businessName}</h4>
                <h5>${response.serviceName}</h5>
                <h5>
                    ${OnSchedHelpers.FormatDuration(response.duration)}
                    - ${response.resourceName}
                </h5>
                <h5>
                    ${bookingDate} @ ${OnSchedHelpers.FormatTime(response.time)}
                </h5>
            </section>

            <section class="onsched-popup-content">
                <form class="onsched-form booking-form">
                    <input type="hidden" name="id" value="${response.id}" />
                    <div class="onsched-form-row">
                        <div class="onsched-form-col">
                            <label for="onsched-field-firstname">First Name</label>
                            <input id="onsched-field-firstname" type="text" name="firstname" autofocus placeholder="* required" required>
                        </div>
                        <div class="onsched-form-col">
                            <label for="onsched-field-lastname">Last Name</label>
                            <input id="onsched-field-lastname" type="text" name="lastname" placeholder="* required" required>
                        </div>
                    </div>
                    <div class="onsched-form-row">
                        <div class="onsched-form-col">
                            <label for="onsched-field-email">Email</label>
                            <input id="onsched-field-email" type="email" name="email" placeholder="Enter valid email address" required>
                        </div>
                        <div class="onsched-form-col">
                            <label for="onsched-field-phone">Phone</label>
                            <input id="onsched-field-phone" type="phone" name="phone" placeholder="Enter phone number (optional)">
                        </div>
                    </div>
                    <div class="onsched-form-privacy-fields">
                        ${privacyFields(options)}
                    </div>
                    <div class="onsched-form-booking-fields">
                        ${bookingFields(response.appointmentBookingFields, "appointment")}
                        ${bookingFields(response.customerBookingFields, "customer")}
                    </div>
                    <div class="onsched-form-row last">
                        <div class="onsched-form-col">
                            <label for="onsched-field-message">Customer Message</label>
                            <textarea id="onsched-field-message" name="customerMessage" cols="3" rows="4" placeholder="Send us a message (optional)"></textarea>
                        </div>
                    </div>
                    <div class="onsched-form-row">
                        <div class="onsched-form-col">
                            <button type="submit" class="btn-submit">Complete Booking</button>
                        </div>
                        <div class="onsched-form-col">
                            <button type="button" class="btn-cancel">Cancel</button>
                        </div>
                    </div>
                </form>
            </section>
            <footer class="onsched-popup-footer" style="display:none;">

            </footer>

        </div>
    </div>

        `;
        return tmplBookingForm;
    }
    function bookingTimer(params) {
        const tmplBookingTimer = `

        `;
        return tmplBookingTimer;
    }
    function popupFormHeader() {
        const tmplPopupFormHeader = `
            <header class="onsched-popup-header">
                <i class="fa fa-clock" style="margin-right:8px;font-size:18px;color:#1a73e8;"></i>
                <span class="booking-timer">2:00 mins</span>&nbsp;to complete booking
                <a href="#" class="onsched-close-btn" title="Close" aria-label="close modal" data-close></a>
            </header>
        `;
        return tmplPopupFormHeader;
    }

    function confirmation(appointment, locale) {
        var date = OnSchedHelpers.ParseDate(appointment.dateInternational);
        var options = {
            weekday: "short", year: "numeric", month: "short",
            day: "numeric"
        };  
        var formattedDate = date.toLocaleString(locale, options);
        const tmplConfirmation = `
            <div class="onsched-container onsched-confirmation-container">
                <div class="onsched-row">
                    <div class="onsched-col">
                        <div class="onsched-booking-confirmation">
                            <h4>${appointment.businessName}</h4>
                            <p>Your appointment has been confirmed ${appointment.name}. See details below.</p>
                            <p> </p>
                            <p>${formattedDate} @ ${OnSchedHelpers.FormatTime(appointment.time)}</p>
                            <p>${appointment.serviceName} ${OnSchedHelpers.FormatDuration(appointment.duration)} - ${appointment.resourceName}</p>
                            <p>Confirmation#: ${appointment.confirmationNumber}</p>
                            <p style="font-size:smaller">You will receive an email or sms booking confirmation shortly.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return tmplConfirmation;
    }
    function dataValue(value) {
        if (value == undefined)
            return "";
        else
            return value;
    }

    //
    // SETUP TEMPLATES
    //
    function locationSetup(locale, data) {

        const tmplLocationSetup = `
        <div class="onsched-container">
        <form class="onsched-wizard onsched-form" name="locationSetup">
            <input type="hidden" name="step" value="0" />
            ${wizardTitle("Location Setup", data)}
            <div class="onsched-wizard-section">
                <h2>General Information</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="businessName">Business Name</label>
                        <input id="businessName" type="text" name="name" value="${dataValue(data.name)}" required="required" data-post="root"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for="businessTimezone">Timezone</label>
                        <select id="businessTimezone" class="onsched-select" name="timezoneName" value="${dataValue(data.timezoneName)}" data-post="root">
                            ${TimezoneSelectOptions(Timezones())}
                        </select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="businessEmail">Email</label>
                        <input id="businessEmail" type="email" name="email" value="${dataValue(data.email)}" data-post="root" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="businessWebsite">Website</label>
                        <input id="businessWebsite" type="text" name="website" value="${dataValue(data.website)}" data-post="root" />
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="businessPhone">Phone</label>
                        <input id="businessPhone" type="tel" name="phone" value="${dataValue(OnSchedHelpers.FormatPhoneNumber(data.phone))}" data-post="root" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="businessFax">Fax</label>
                        <input id="businessFax" type="tel" name="fax" value="${dataValue(OnSchedHelpers.FormatPhoneNumber(data.fax))}" data-post="root" />
                    </div>
                </div>
            </div>

            <div class="onsched-wizard-section">
                <h2>Business Address</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine1">Address Line 1</label>
                        <input id="addressLine1" type="text" name="addressLine1" value="${dataValue(data.address.addressLine1)}" data-post="address"/>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine2">Address Line 2</label>
                        <input id="addressLine2" type="text" name="addressLine2" value="${dataValue(data.address.addressLine1)}"  data-post="address"/>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="city">City</label>
                        <input id="city" type="text" name="city" value="${dataValue(data.address.city)}"  data-post="address" data-post="address"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for="state">State / Province</label>
                        <select id="state" name="state" value="${dataValue(data.address.state)}" class="onsched-select" data-post="address"></select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="country">Country</label>
                        <select id="country" name="country" value="${dataValue(data.address.country)}" class="onsched-select" data-post="address">
                            <option></option>
                            <option value="CA">Canada</option>
                            <option value="US">United States</option>
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="postalCode">Zip / Postal Code</label>
                        <input id="postalCode" type="text" name="postalCode" value="${dataValue(data.address.postalCode)}" data-post="address"/>
                    </div>
                </div>
            </div>
            <div class="onsched-wizard-section">
                <h2>Business Hours</h2>
                <h4 class="onsched-business-hours-tz"></h4>
                <div class="onsched-business-hours">${OnSchedTemplates.businessHoursTable(locale, data.businessHours)}</div>
            </div>
            <div class="onsched-wizard-nav">
                <div style="display:table-row">
                    <div class="onsched-wizard-nav-status">
                        <!-- Circles which indicates the steps of the form: -->
                        <span class="step active"></span>
                        <span class="step"></span>
                        <span class="step"></span>
                    </div>
                    <div style="display:table-cell">
                        <div class="onsched-progress-container">
                        <div class="onsched-progress">
                            <div class="indeterminate"></div>
                            </div>
                        </div>
                    </div>
                    <div class="onsched-wizard-nav-buttons">
                        <button type="button" id="prevButton" class="prevButton">Previous</button>
                        <button type="submit" id="nextButton" class="nextButton">Next</button>
                    </div>
                </div>
            </div>
        </form>
    </div>

        `;

        return tmplLocationSetup;

    }

    function resourceSetup(locale, data) {

        const tmplResourceSetup = `
        <div class="onsched-container">
        <form class="onsched-wizard onsched-form" name="resourceSetup">
            <input type="hidden" name="step" value="0" />
            ${wizardTitle("Resource Setup", data)}

            <div class="onsched-wizard-section">
                <h2>General Information</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="resourceName">Resource Name</label>
                        <input id="resourceName" type="text" name="name" value="${dataValue(data.name)}" required="required" data-post="root"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for="resourceTimezone">Timezone</label>
                        <select id="resourceTimezone" class="onsched-select" name="timezoneName" value="${dataValue(data.timezoneName)}" data-post="root">
                            ${TimezoneSelectOptions(Timezones(), true)}
                        </select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="${dataValue(data.email)}" data-post="root"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for="groupId">Group</label>
                        <select id="groupId" name="groupId"  value="${dataValue(data.groupId)}" class="onsched-select" data-post="root"></select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" placeholder="Enter Resource Description" data-post="root">${dataValue(data.description)}
                    </textarea>                    
                    </div>
                </div>
                 <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label>Image preview</label>
                        ${previewImage(data)}
                    </div>
                    <div class="onsched-form-col">
                        <label>Upload Image</label>
                        <div>
                            <input type="file" accept="image/*" id="onsched-system-file-upload" name="onsched-system-file-upload" hidden="hidden">
                            <button type="button" class="onsched-file-upload-btn">Choose a file</button>
                            <span id="onsched-file-upload-txt" class="onsched-file-upload-txt">No file chosen yet.</span>
                        </div>
                    </div>                    

                </div>               
            </div>

            <div class="onsched-wizard-section">
                <h2>Contact Information</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="businessPhone">Business Phone</label>
                        <input type="tel" id="businessPhone" name="businessPhone"
                            value="${dataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.businessPhone))}" data-post="contact"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for=""mobilePhone>Mobile Phone</label>
                        <input type="tel" id="mobilePhone" name="mobilePhone" 
                            value="${dataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.mobilePhone))}" data-post="contact" />
                    </div>

                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="homePhone">Home Phone</label>
                        <input type="tel" id="homePhone" name="homePhone" 
                            value="${dataValue(OnSchedHelpers.FormatPhoneNumber(data.contact.homePhone))}" data-post="contact" />
                    </div> 
                    <div class="onsched-form-col">
                        <label for="preferredPhoneType">Preferred Contact Phone</label>
                        <select class="form-control" id="preferredPhoneType" name="preferredPhoneType" value="${dataValue(data.contact.preferredPhoneType)}" data-post="contact">
                            <option value="B" selected="selected">Business</option>
                            <option value="M" selected="selected">Mobile</option>
                            <option value="H">Home</option>
                        </select>
                    </div>                                     
                </div>      
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="notificationType">Notification Type</label>
                        <select class="onsched-select" id="notificationType" name="notificationType" value="${dataValue(data.notificationType)}" aria-required="true" aria-invalid="false" data-post="root">
                            <option value="0"></option>
                            <option value="1" selected="selected">Email</option><option value="2">SMS</option>
                            <option value="3">Email and SMS</option>
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="bookingNotification">Booking Notifications</label>
                        <select class="form-control" id="bookingNotification" name="bookingNotification" value="${dataValue(data.bookingNotifications)}" aria-required="true" aria-invalid="false" data-post="root">
                            <option value="0">None</option>
                            <option value="1" selected="selected">Online Bookings</option>
                            <option value="2">All Bookings &amp; Reminders</option>
                        </select>
                    </div>
                </div>                          
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="">Skype Username</label>
                        <input type="text" id="skypeUsername" name="skypeUsername" value="${dataValue(data.contact.skypeUsername)}"  data-post="contact"/>
                    </div>
                    <div class="onsched-form-col">
                    </div>
                </div>
            </div>

            <div class="onsched-wizard-section">
                <h2>Address</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine1">Address Line 1</label>
                        <input id="addressLine1" type="text" name="addressLine1" value="${dataValue(data.address.addressLine1)}" data-post="address"/>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine2">Address Line 2</label>
                        <input id="addressLine2" type="text" name="addressLine2" value="${dataValue(data.address.addressLine2)}" data-post="address" />
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="city">City</label>
                        <input id="city" type="text" name="city" value="${dataValue(data.address.city)}" data-post="address"/>
                    </div>
                    <div class="onsched-form-col">
                        <label for="state">State / Province</label>
                        <select id="state" name="state" value="${dataValue(data.address.state)}" class="onsched-select" data-post="address"></select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="country">Country</label>
                        <select id="country" name="country" value="${dataValue(data.address.country)}" class="onsched-select" data-post="address">
                            <option></option>
                            <option value="CA">Canada</option>
                            <option value="US">United States</option>
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="postalCode">Zip / Postal Code</label>
                        <input id="postalCode" type="text" name="postalCode" value="${dataValue(data.address.postalCode)}" data-post="address" />
                    </div>
                </div>
            </div>
            <div class="onsched-wizard-section">
                <h2>Availability</h2>
                <h4 class="onsched-business-hours-tz">Eastern Timezone</h4>
                <div class="onsched-business-hours">${OnSchedTemplates.businessHoursTable(locale, data.availability)}</div>
            </div>
            <div class="onsched-wizard-section">
                <h2>Custom Fields</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="customField1">Custom Field 1</label>
                        <input type="text" id="customField1" name="field1" value="${dataValue(data.customFields.field1)}" data-post="customFields" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="customField2">Custom Field 2</label>
                        <input type="text" id="customField2" name="field2" value="${dataValue(data.customFields.field2)}" data-post="customFields" />
                    </div>                    
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="customField3">Custom Field 3</label>
                        <input type="text" id="customField3" name="field3" value="${dataValue(data.customFields.field3)}" data-post="customFields" />                    </div>
                    <div class="onsched-form-col">
                        <label for="customField4">Custom Field 4</label>
                        <input type="text" id="customField4" name="field4" value="${dataValue(data.customFields.field4)}" data-post="customFields" />
                    </div>                    
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="customField5">Custom Field 5</label>
                        <input type="text" id="customField5" name="field5" value="${dataValue(data.customFields.field5)}" data-post="customFields" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="customField6">Custom Field 6</label>
                        <input type="text" id="customField6" name="field6" value="${dataValue(data.customFields.field6)}" data-post="customFields" />                    
                    </div>                    
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="customField7">Custom Field 7</label>
                        <input type="text" id="customField7" name="field7" value="${dataValue(data.customFields.field7)}" data-post="customFields" />  
                    </div>
                    <div class="onsched-form-col">
                        <label for="customField8">Custom Field 8</label>
                        <input type="text" id="customField8" name="field8" value="${dataValue(data.customFields.field8)}" data-post="customFields" />                      
                    </div>                    
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="customField9">Custom Field 9</label>
                        <input type="text" id="customField9" name="field9" value="${dataValue(data.customFields.field9)}" data-post="customFields" />                       
                    </div>
                    <div class="onsched-form-col">
                        <label for="customField10">Custom Field 10</label>
                        <input type="text" id="customField10" name="field10" value="${dataValue(data.customFields.field10)}" data-post="customFields" />                       
                    </div>                    
                </div>                                                                
            </div>


            <div class="onsched-wizard-nav">
                <div style="display:table-row">
                    <div class="onsched-wizard-nav-status">
                        <!-- Circles which indicates the steps of the form: -->
                        <span class="step active"></span>
                        <span class="step"></span>
                        <span class="step"></span>
                        <span class="step"></span>
                        <span class="step"></span>
                    </div>
                    <div class="onsched-wizard-nav-buttons">
                        <button type="button" id="prevButton" class="prevButton">Previous</button>
                        <button type="submit" id="nextButton" class="nextButton">Next</button>
                    </div>
                </div>
            </div>
        </form>
    </div>        
        `;

        return tmplResourceSetup;
    }

    function serviceSetup() {
        const tmplServiceSetup = `
        <div class="onsched-container">
        <form class="onsched-wizard onsched-form" name="serviceSetup">
            <input type="hidden" name="step" value="0" />
            <h1>Service Setup</h1>
            <div class="onsched-wizard-section">
                <h2>Name & Contact Information</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="serviceName">Service Name</label>
                        <input id="serviceName" type="text" name="serviceName" required="required" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="businessTimezone">Timezone</label>
                        <select id="businessTimezone" class="onsched-select" name="timezoneName">${TimezoneSelectOptions(Timezones())}</select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label>Email</label>
                        <input type="email" name="businessEmail" />
                    </div>
                    <div class="onsched-form-col">
                        <label>Website</label>
                        <input type="text" name="businessWebsite" />
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label>Phone</label>
                        <input type="tel" name="businessPhone" />
                    </div>
                    <div class="onsched-form-col">
                        <label>Fax</label>
                        <input type="tel" name="businessFax" />
                    </div>
                </div>
            </div>

            <div class="onsched-wizard-section">
                <h2>Business Address</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine1">Address Line 1</label>
                        <input id="addressLine1" type="text" name="addressLine1" />
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="addressLine2">Address Line 2</label>
                        <input id="addressLine2" type="text" name="addressLine2" />
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="city">City</label>
                        <input id="city" type="text" name="city" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="state">State / Province</label>
                        <select id="state" name="state" class="onsched-select"></select>
                    </div>
                </div>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="country">Country</label>
                        <select id="country" name="country" class="onsched-select">
                            <option></option>
                            <option value="CA">Canada</option>
                            <option value="US">United States</option>
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="postalCode">Zip / Postal Code</label>
                        <input id="postalCode" type="text" name="postalCode" />
                    </div>
                </div>
            </div>
            <div class="onsched-wizard-section">
                <div style="display:table;width:100%;">
                    <div style="display:table-row">
                        <div style="display:table-cell">
                            <h2>Business Hours</h2>
                        </div>
                        <div style="display:table-cell;text-align:right">
                        </div>
                    </div>
                    </div>
                    <h4 class="onsched-business-hours-tz">Eastern Timezone</h4>
                    <div class="onsched-business-hours"></div>
            </div>
            <div class="onsched-wizard-nav">
                <div style="display:table-row">
                    <div class="onsched-wizard-nav-status">
                        <!-- Circles which indicates the steps of the form: -->
                        <span class="step active"></span>
                        <span class="step"></span>
                        <span class="step"></span>
                    </div>
                    <div class="onsched-wizard-nav-buttons">
                        <button type="button" id="prevButton" class="prevButton">Previous</button>
                        <button type="submit" id="nextButton" class="nextButton">Next</button>
                    </div>
                </div>
            </div>
        </form>
    </div>        
        `;

        return tmplServiceSetup;
    }

    function wizardTitle(title, data) {
        const markup = `
            <div style="display:table;width:100%;">
                <div style="display:table-cell">
                    <h1>${title}</h1>
                </div>
                <div style="display:table-cell;text-align:right;">
                    <h4>${data.id == undefined || data.id.length == 0 ? "Create" : "Edit"} Mode</h4>
                </div>            
            </div>
        `;
        
        return markup;
    }

    function previewImage(data) {
        const markup = `
            <img id="onsched-image-preview" 
                src="${data.id == undefined || data.id.length == 0 || data.imageUrl.length == 0 ? placeholderIcon : data.imageUrl}" 
                width="50" height="50" data-post="image" />
        `;

        return markup;
    }

    function stateSelectOptions(states) {
            // First prep the response data into a 2d array by country

            var countryArr = [];
            var stateArr = [];
            var countryObject;
            // keep reading entries until the company changes, then save and continue

            var prevCountry = null;

            for (var i = 0; i < states.length; i++) {
                if (prevCountry == null) {
                    prevCountry = states[i].country;
                    countryObject = new CountryObject(states[i].country, states[i].countryName)
                }
                else
                if (prevCountry != states[i].country) {
                    // add an entry to the country array entry with states
                    countryObject.states = stateArr;
                    countryArr.push(countryObject);
                    // reset vars for new country
                    countryObject = new CountryObject(states[i].country, states[i].countryName)
                    prevCountry = states[i].country;
                    stateArr = [];
                }

                // add an entry for the state
                stateArr.push(states[i]);
            }
            // now we process the last entry
            countryObject.states = stateArr;
            countryArr.push(countryObject);

            // Now just template the mapped data to populate the select options with optgroups

            const markup = `
                <option></option>
                ${countryArr.map((country, index) =>
                    `
                    <optGroup label="${country.countryName}" value="${country.country}">
                    ${ countryStateOptions(country.states) }
                    </optgroup>
                    `
                ).join("")}
            `;

            return markup;
    }

    function resourceGroupOptions(groups) {
        const markup = `
            <option value="">None</option>
            ${groups.map((group, index) =>
                `
                <option value="${group.id}">${group.name}</option>
                `
            ).join("")}
        `;
        return markup;
    }

    function countryStateOptions(states) {
        const markup = `
            ${states.map((state, index) =>
                `
                <option value="${state.code}" data-country="${state.country}">${state.name}</option>
                `
            ).join("")}
        `;
        return markup;
    }

    function countrySelectOptions(states) {
             // First prep the response data into a 2d array by country

             var countryArr = [];
             var countryObject;
             // keep reading entries until the company changes, then save and continue
 
             var prevCountry = null;
 
             for (var i = 0; i < states.length; i++) {
                 if (prevCountry == null) {
                     prevCountry = states[i].country;
                     countryObject = new CountryObject(states[i].country, states[i].countryName)
                 }
                 else
                     if (prevCountry != states[i].country) {
                         // add an entry to the country array entry with states
                         countryArr.push(countryObject);
                         // reset vars for new country
                         countryObject = new CountryObject(states[i].country, states[i].countryName)
                         prevCountry = states[i].country;
                     }
             }
             // now we process the last entry
             countryArr.push(countryObject);
 
             // Now just template the mapped data to populate the select options with optgroups
 
             const markup = `
                 <option></option>
                 ${countryArr.map((country, index) =>
                 `
                     <option value="${country.country}">${country.countryName}</option>
                     `
                 ).join("")}
             `;
 
             return markup;
    }

    function businessHoursTable(locale, data) {
        var daysOfWeek = [];
        var dtSun = new Date(1960, 10 - 1, 30, 0, 0, 0, 0);
        var dtSat = new Date(dtSun);
        dtSat.setDate(dtSun.getDate() + 6);

        for (var date = new Date(dtSun); date <= dtSat; date.setDate(date.getDate() + 1)) {
            daysOfWeek.push([new Date(date)]);
        }

        const markup = `
            <div class="onsched-business-hours-row">
                <div class="onsched-business-hours-day"></div>
                ${daysOfWeek.map((dayOfWeek, index) =>
                    `${businessHoursDayCell(dayOfWeek, locale)}`
                ).join("")}
            </div>
            <div class="onsched-business-hours-row start">
                <div class="onsched-business-hours-time">
                    <label>Start</label>
                </div>
                ${daysOfWeek.map((dayOfWeek, index) =>
                    `${businessHoursTimeCell(dayOfWeek, locale, true, data)}`
                ).join("")}
            </div>
            <div class="onsched-business-hours-row end">
                <div class="onsched-business-hours-time">
                    <label>End</label>
                </div>
                ${daysOfWeek.map((dayOfWeek, index) =>
                    `${businessHoursTimeCell(dayOfWeek, locale, false, data)}`
                ).join("")}
            </div>
        `;
        return markup;
    }

    function businessHoursDayCell(dayOfWeek, locale) {
        var date = new Date(dayOfWeek);
        const markup = `
            <div class="onsched-business-hours-day ${date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase()}">
                <div class="onsched-dropdown">
                    <button class="onsched-dropdown-menu-button" title="Click for options">
                        ${date.toLocaleDateString(locale, { weekday: 'long' })}
                        <span class="caret"></span>
                    </button>
                    <ul class="onsched-dropdown-menu" style="display: none;">
                        <li><a href="#" name="open" class="onsched-dropdown-menu-item">Available</a></li>
                        <li><a href="#" name="closed" class="onsched-dropdown-menu-item">Unavailable</a></li>
                        <li><a href="#" name="24hrs" class="onsched-dropdown-menu-item">24 Hours</a></li>
                    </ul>
                </div>
            </div>
        `;
        return markup;
    }

    function businessHoursTimeCell(dayOfWeek, locale, startTimeIndicator, data) {
        var date = new Date(dayOfWeek);
        var weekDay = date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase();
        // need to detect open, closed, 24hrs here and template accordingly
        // data[weekDay].startTime
        // closed = startTime=0 and endTime=0
        // 24 hours = startTime=0 and endTime=2400

        var name = startTimeIndicator ? weekDay + "StartTime" : weekDay + "EndTime";
        const markup = `
            <div class="onsched-business-hours-time ${date.toLocaleDateString("en-US", { weekday: 'short' }).toLowerCase()}">
                <label class="closed" style="display:${data[weekDay].startTime == 0 && data[weekDay].endTime == 0 ? "block" : "none"}">Closed</label>
                <label class="hrs24"  style="display:${data[weekDay].startTime == 0 && data[weekDay].endTime == 2400 ? "block" : "none"}">24 Hours</label>
                <select class="time" name="${name}" style="${showHideTimeSelect(weekDay, data)}" data-post="businessHours">
                    ${initTimesSelectOptions(initTimesSelectData(locale), weekDay, startTimeIndicator, data)}
                </select>
            </div>
        `;
        return markup;
    }

    function showHideTimeSelect(weekDay, data) {
        var closed = data[weekDay].startTime == 0 && data[weekDay].endTime == 0;
        var hrs24 = data[weekDay].startTime == 0 && data[weekDay].endTime == 2400;
        var showSelect = (closed == false && hrs24 == false) ? true : false;
//        console.log("ShowHideTimeSelect " + weekDay + "-", showSelect);
        if (showSelect)
            return "display:block";
        else
            return "display:none";
    }

    function initTimesSelectOptions(times, weekDay, startTimeIndicator, data) {
        const markup = `
            ${times.map((time, index) =>
                `<option value="${time[0]}" ${getTimeSelectedAttr(weekDay, startTimeIndicator, time[0], data)}>${time[1]}</option>`
            ).join("")}           
        `;
        return markup;
    }

    function initTimesSelectData(locale) {
        locale = locale === undefined ? "en-US" : locale;
        var startTime = new Date(1960, 10 - 1, 30, 0, 0, 0, 0);
        var endTime = new Date(1960, 10 - 1, 31, 0, 0, 0, 0);
        var militaryTime = 0;
        var timesData = [];
        for (var time = new Date(startTime); time <= endTime; time.setMinutes(time.getMinutes() + 30)) {
            militaryTime = time < endTime ? time.getHours() * 100 + time.getMinutes() : 2400;
            timesData.push([militaryTime, time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })]);
        }
        // can template this data
        return timesData;
    }

    function getTimeSelectedAttr(weekDay, startTimeIndicator, time, data) {
        var dataTime = startTimeIndicator ? data[weekDay].startTime : data[weekDay].endTime;
        return dataTime == time ? "selected=\"selected\"" : "";
    }

    //
    //  TEMPLATE HELPER FUNCTIONS. MIGRATE THESE TO HELPERS
    //

    function CountryObject(code, name) {
        this.country = code;
        this.countryName = name;
        this.states = [];
    }
    function getDisabledMonthPrev(availableDays) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var firstDay = availableDays[0];
        var firstDayDate = ParseDate(firstDay.date);
        if (firstDay.reasonCode == 500 || firstDayDate == today)
            return "disabled=\"disabled\"";
        else
            return "";
    }
    function getDisabledMonthNext(availableDays) {
        var lastDay = availableDays[availableDays.length - 1];
        if (lastDay.reasonCode == 501)
            return "disabled=\"disabled\"";
        else
            return "";
    }
    function getLettersForIcon(text) {
        if (text.length < 1)
            return "";
        var parts = text.split(" ");
        var firstPart = parts[0];
        var secondPart = parts.length > 1 ? parts[1] : "";
        secondPart = secondPart.length > 0 ? secondPart :
            firstPart.length > 1 ? firstPart[2] : "";
        var initials = secondPart.length > 0 ?
            firstPart[0] + secondPart[0] : firstPart[0];
        initials = initials.toUpperCase();
        return initials;
    }

    function getAvailableMonthWeeks(availableDays, date) {
        // To render the calendar html with templates we need to transform the 
        // available days into an array of weeks of the month.
        var weeksInMonth = getDisplayableWeeks(date);
        var weekStartDate = ParseDate(availableDays[0].date);
        var monthWeeks = [];
        for (var i = 0; i < weeksInMonth; i++) {
            var week = [];
            for (var j = 0; j < 7; j++) {
                week.push(availableDays[i * 7 + j]);
            }
            weekStartDate = AddDaysToDate(weekStartDate, 7);
            monthWeeks.push(week);
        }
        return monthWeeks;
    }
    function availableDaysFromDate(date) {
        // build array of availableDays using only a date
        // this can be built quickly before availability call completes

        // How many days to I need. Same as daysToPull calculation
        // Days to pull calculation now going to be all displayableDays
        var firstDate = getFirstDisplayableDate(date);
        var weeks = getDisplayableWeeks(date);
        var displayableDays = weeks * 7;
        //        var lastDate = AddDaysToDate(firstDate, displayableDays);
        // start at firstDate and iterate through until hit last date
        var workingDate = new Date(firstDate);
        var availableDays = [];
        for (var i = 0; i < displayableDays; i++) {
            var availableDay = new AvailableDay(workingDate);
            availableDays.push(availableDay);
            workingDate = AddDaysToDate(workingDate, 1);
        }
        return availableDays;
    }

    function getFirstDisplayableDate(date) {
        // first get the beginning of month
        // then go backwards to sunday
        var firstDayOfMonth = FirstDayOfMonth(date);
        var dow = firstDayOfMonth.getDay();
        var weekStartDate = AddDaysToDate(firstDayOfMonth, -dow);
        return weekStartDate;
    }
    function getDisplayableWeeks(date) {
        var firstDay = FirstDayOfMonth(date);
        var lastDay = LastDayOfMonth(date);

        var dow = firstDay.getDay();
        var displayableMonthDaysWeekOne = 7 - dow;
        var remainingDisplayableDays = lastDay.getDate() - displayableMonthDaysWeekOne;
        var remainingDisplayableWeeks = Math.floor(remainingDisplayableDays / 7) + (remainingDisplayableDays % 7 > 0 ? 1 : 0);
        var totalDisplayableWeeks = remainingDisplayableWeeks + 1;
        return totalDisplayableWeeks;
    }
    function AvailableDay(date) {
        try {
            var today = new Date();
            var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0"+date.getDate()).slice(-2);
            this.date = dateString;
            this.closed = date < today ? true : false;
            this.available = date < today ? false : true;
            this.reasonCode = date < today ? 100 : 0;
            this.reason = date < today ? "Date in past" : "Day is available";
        } catch (e) {
            logException("AvailableDay", e);
        }
    }
    function IsToday(day, selectedDate) {
        const today = new Date();
        var date = ParseDate(day.date);
        var isToday =
            date.getDate() == today.getDate() &&
            date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear();
        return isToday ? "today" : "";
    }

    function IsSelected(day, selectedDate) {
        var date = ParseDate(day.date);
        var isSelected =
            date.getDate() == selectedDate.getDate() &&
            date.getMonth() == selectedDate.getMonth() &&
            date.getFullYear() == selectedDate.getFullYear();
        return isSelected ? "selected" : "";
    }
    function IsAvailable(day) {
        if (day.available)
            return "";
        else
            return "disabled=disabled";
    }
    function ParseDate(dateString) {
        var utcDate = new Date(Date.parse(dateString));
        var date = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        return date;
    }
    function FirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    function LastDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    function AddDaysToDate(inputDate, days) {
        var date = new Date(inputDate);
        date.setDate(date.getDate() + days);
        return date;
    }

    function DatesAreEqual(date1, date2) {
        var equal = false;
        if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate())
            equal = true;

        return equal;
    }

    function timeFromMilitaryTime(time, locale) {
        var hours = time / 100;
        var mins = time % 100;
        var timeDate = new Date(1960, 10-1, 30, hours, mins, 0);
        return timeDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
    }

    function timeFromDisplayTime(displayTime) {
        var spaceIndex = displayTime.indexOf(" ");
        var time = displayTime.substr(0, spaceIndex);
        return time;
    }
    function ampmFromDisplayTime(displayTime) {
        var spaceIndex = displayTime.indexOf(" ");
        var ampm = displayTime.substr(spaceIndex + 1);
        return ampm;
    }

    // Timezone select functions

    function TimezoneSelectOptions(tzRegionData, businessTzOption) {
        // need to do this template style in onschedjs
        const markup = `
            ${BusinessTzOption(businessTzOption)}
            ${tzRegionData.map((tzRegion, index) =>
                `${TimezoneOptionGroups(tzRegion.name, tzRegion.timezones)}`
            ).join("")}
        `;
        return markup;
    }

    function BusinessTzOption(value) {
        if (value == undefined) {
            return "";
        }
        else {
            const markup = `
                <option value="">Business Location Timezone</option>
            `;
            return markup;
        }
    }

    function TimezoneOptionGroups(name, timezones) {
        // need to do this template style in onschedjs
        const markup = `
            <optgroup label="${name}">              
            ${timezones.map((timezone, index) =>
            `<option value="${timezone.offset}" data-offset="${timezone.offset}" data-tz="${timezone.id}">${timezone.name}</option>`
            ).join("")}
            </optgroup>
        `;
        return markup;
    }

    function Timezones() {
        var tzRegionData = [
            { "name": "US / Canada", "timezones": TzUsCanada() },
            { "name": "Europe", "timezones": TzEurope() },
            { "name": "Australia", "timezones": TzAustralia() },
        ];
        return tzRegionData;
    }
    function TzUtcTime(tzData) {
        var today = new Date();
        for (var i = 0; i < tzData.length; i++) {
            var m = moment.tz(today, tzData[i].id);
            tzData[i].name += " " + "(UTC" + m.format("Z") + ")";
            tzData[i].offset = m.utcOffset();
        }
        return tzData;
    }
    function TzUsCanada() {

        var tzData = [

            { "name": "Pacific Time", "id": "America/Los_Angeles", "offset": "0"},
            { "name": "Mountain Time", "id": "America/Denver", "offset": "0" },
            { "name": "Central Time", "id": "America/Chicago", "offset": "0" },
            { "name": "Eastern Time", "id": "America/New_York", "offset": "0" },
            { "name": "Alaska Time", "id": "America/Anchorage", "offset": "0" },
            { "name": "Hawaii Time", "id": "Pacific/Honolulu", "offset": "0" },
            { "name": "Atlantic Time", "id": "America/Halifax", "offset": "0" },
            { "name": "Newfoundland Time", "id": "America/St_Johns", "offset": "0" }
        ];

        return TzUtcTime(tzData);
    }
    function TzEurope() {
        var tzData = [

            { "name": "UK,Ireland,Lisbon", "id": "Europe/London", "offset": "0" },
            { "name": "Central European Time", "id": "Europe/Madrid", "offset": "0" },
            { "name": "Eastern European Time", "id": "Europe/Bucharest", "offset": "0" },
            { "name": "Minsk Time", "id": "Europe/Minsk", "offset": "0" },
        ];
        return TzUtcTime(tzData);
    }
    function TzAustralia() {
        var tzData = [

            { "name": "Australian Western Time", "id": "Australia/Perth", "offset": "0" },
            { "name": "Australian Central Western Time", "id": "Australia/Eucla", "offset": "0" },
            { "name": "Austrailian Adelaide Time", "id": "Australia/Adelaide", "offset": "0" },
            { "name": "Austrailian Brisbane Time", "id": "Australia/Brisbane", "offset": "0" },
            { "name": "Austrailian Eastern Time", "id": "Australia/Sydney", "offset": "0" },
            { "name": "Austrailian Lord Howe Time", "id": "Australia/Lord_Howe", "offset": "0" },
        ];
        return TzUtcTime(tzData);
    }
    function TzAsia() {
        var tzData = [

            { "name": "Placeholder", "id": "America/Los_Angeles", "offset": "0" },

        ];
        return TzUtcTime(tzData);
    }
    function TzAtlantic() {
        var tzData = [
            { "name": "Placeholder", "id": "America/Los_Angeles", "offset": "0" },

        ];
        return TzUtcTime(tzData);
    }
    function TzPacific() {
        var tzData = [
            { "name": "Placeholder", "id": "America/Los_Angeles", "offset": "0" },

        ];
        return TzUtcTime(tzData);
    }

    return {
        availabilityContainer: availabilityContainer,
        timesContainer: timesContainer,
        availableTimes: availableTimes,
        availableTimes2: availableTimes2,
        weeklyDateSelector: weeklyDateSelector,
        calendarSelector: calendarSelector,
        calendarSelectorFromDate: calendarSelectorFromDate,
        servicesList: servicesList,
        resourcesList: resourcesList,
        resourceSetup: resourceSetup,
        locationsList: locationsList,
        locationSetup: locationSetup,
        serviceSetup: serviceSetup,
        searchForm: searchForm,
        confirmation: confirmation,
        bookingForm: bookingForm,
        bookingTimer: bookingTimer,
        popupFormHeader: popupFormHeader,
        errorBox: errorBox,
        selectField: selectField,
        inputField: inputField,
        resourceGroupOptions: resourceGroupOptions,
        stateSelectOptions: stateSelectOptions,
        countrySelectOptions: countrySelectOptions,
        businessHoursTable: businessHoursTable,
        wizardTitle:wizardTitle,
        previewImage:previewImage,
    };
}();



var OnSchedRest = function () {

    async function Authorize(clientId, environment, scope) {
        var headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

        var url = environment == null || environment == "sbox" ?
            "https://sandbox-js.onsched.com/auth/initialize" : "https://js.onsched.com/auth/initialize";

        scope = scope == null ? "OnSchedApi" : scope;

        var payload = { "clientId": clientId, "scope": scope };
        var request = new Request(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: 'cors',
            headers: headers
        });
        const response = await fetch(request);
        const json = await response.json().catch(function (error) {
            console.log(error);
        });
        if (json.success == false) {
            reject (new Error(json.message));
//            console.log(json.message);
        }

        return json.access_token;
    }

    async function GetAccessToken(environment) {
        try {
            var url = environment == null || environment == "sbox" ?
                "https://sandbox-identity.onsched.com/connect/token" :
                "https://identity.onsched.com/connect/token";
            var clientId = "DemoUser";
            var clientSecret = "DemoUser";

            var postData = "client_id=" + clientId;
            postData += "&";
            postData += "client_secret=" + clientSecret;
            postData += "&";
            postData += "grant_type=client_credentials";
            postData += "&";
            postData += "scope=OnSchedApi";

            var request = new Request(url, {
                method: 'POST',
                body: postData,
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            });

            const response = await fetch(request);
            const json = await response.json();
            return json.access_token;
        } catch (e) {
            console.log(e);
        }
    }

    function Get(token, url, callback) {
        try {
            var headers = token == null ?
                new Headers({ 'Accept': 'application/json' }) :
                new Headers({ 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

            var request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: headers
            });

            fetch(request)
                .then((response) =>
                {
                    if (response.status != 401) // for debugging auth errors
                        return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
                    else
                        return new Promise((resolve) => resolve({ status: response.status, ok: response.ok, json: '' }));
                }).then(({ status, json, ok }) => {
                    var validation = status == 400;
                    ok ? callback(json) : callback({ error: true, code: status, validation: validation, data:json });
                    HideProgress();
                })
                .catch(function (error) {
                    console.log(error);
                    HideProgress();
                });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async function PostValidateJwt(url, payload) {

        var headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

        var request = new Request(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: 'cors',
            headers: headers
        });

        const response = await fetch(request);
        const json = await response.json();

        return json;
    }

    function Post(token, url, payload, callback) {

        var headers = token == null ?
            new Headers({ 'Content-Type': 'application/json','Accept': 'application/json' }) :
            new Headers({ 'Content-Type': 'application/json','Accept': 'application/json', 'Authorization': 'Bearer ' + token });

        var request = new Request(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: 'cors',
            headers: headers
        });
        fetch(request)
            .then((response) => {
                return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
            }).then(({ status, json, ok }) => {
                var validation = status == 400;
                ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
                HideProgress();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function Put(token, url, payload, callback) {

        var headers = token == null ?
            new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) :
            new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

        var request = new Request(url, {
            method: 'PUT',
            body: JSON.stringify(payload),
            mode: 'cors',
            headers: headers
        });

        fetch(request)
            .then((response) => {
                return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
            }).then(({ status, json, ok }) => {
                var validation = status == 400;
                ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
                HideProgress();
            })
            .catch(function (error) {
                HideProgress();
                console.log(error);
            });
    }
    function Delete(token, url, callback) {

        var headers = token == null ?
            new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) :
            new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

        var request = new Request(url, {
            method: 'DELETE',
            mode: 'cors',
            headers: headers
        });
        fetch(request)
            .then((response) => {
                return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
            }).then(({ status, json, ok }) => {
                var validation = status == 400;
                ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
                HideProgress();
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    function PostAppointment(token, url, payload, callback) {
        return Post(token, url, payload, callback);
    }

    function PostCustomer(token, url, payload, callback) {
        return Post(token, url, payload, callback);
    }

    function PutAppointmentBook(token, url, payload, callback) {

        return Put(token, url, payload, callback);

    }
    function DeleteAppointment(token, url, callback) {
        return Delete(token, url, callback);
    }
    function GetAvailability(token, url, callback) {
        return Get(token, url, callback);
    }

    function GetLocations(token, url, callback) {
        return Get(token, url, callback);
    }

    function GetServiceGroups(token, url, callback) {
        return Get(token, url, callback);
    }

    function GetServices(token, url, callback) {
        return Get(token, url, callback);
    }
    function GetCustomers(token, url, callback) {
        return Get(token, url, callback);
    }
    function GetResources(token, url, callback) {
        return Get(token, url, callback);
    }
    function GetResourceGroups(token, url, callback) {
        return Get(token, url, callback);
    }
    // Setup interface rest calls

    function PostLocation(token, url, payload, callback) {
        return Post(token, url, payload, callback);
    }
    function PutLocation(token, url, payload, callback) {
        return Put(token, url, payload, callback);
    }
    function PostResource(token, url, payload, callback) {
        return Post(token, url, payload, callback);
    }
    function PutResource(token, url, payload, callback) {
        return Put(token, url, payload, callback);
    }    
    function PostResourceImage(token, url, payload, callback) {
        return Post(token, url, payload, callback);
    }
    function ShowProgress() {
        var indicators = document.getElementsByClassName("onsched-progress");
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].style.display = "block";
        }
    }
    function HideProgress() {
        var indicators = document.getElementsByClassName("onsched-progress");
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].style.display = "none";
        }
    }
    return {
        Authorize: Authorize,
        GetAccessToken: GetAccessToken,
        Get: Get,
        PostValidateJwt: PostValidateJwt,
        Post: Post,
        Put: Put,
        Delete:Delete,
        GetAvailability: GetAvailability,
        PostAppointment: PostAppointment,
        PostCustomer: PostCustomer,
        PutAppointmentBook: PutAppointmentBook,
        DeleteAppointment: DeleteAppointment,
        GetLocations: GetLocations,
        GetServiceGroups: GetServiceGroups,
        GetServices: GetServices,
        GetResources: GetResources,
        GetResourceGroups: GetResourceGroups,
        GetCustomers: GetCustomers,
        PostLocation: PostLocation,
        PutLocation: PutLocation,
        PostResource: PostResource,
        PutResource: PutResource,
        PostResourceImage:PostResourceImage,
        ShowProgress: ShowProgress,
        HideProgress: HideProgress
    };

}();


export {
    OnSched,
    OnSchedHelpers,
    OnSchedTemplates,
    OnSchedRest
}

