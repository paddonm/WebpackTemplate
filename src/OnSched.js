/*!
 * OnSchedJ (http://onsched.com)
 * Copyright 2014-2020 OnSched
 */

'use strict';
import * as Sentry from '@sentry/browser';
import moment from 'moment';
import momenttimezone from 'moment-timezone';

import './assets/css/index.css';

import { OnSchedMount }     from './OnSchedMount'
import { OnSchedRest }      from './OnSchedRest'
import { OnSchedOnChange }  from './utils/OnSchedOnChange'
import { OnSchedOnClick }   from './utils/OnSchedOnClick'
import { OnSchedHelpers }   from './utils/OnSchedHelpers'
import { OnSchedTemplates } from './OnSchedTemplates'

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

                    let elementName = element.type.charAt(0).toUpperCase() 
                                    + element.type.slice(1) 
                                    + 'Element'

                    OnSchedMount[elementName](this)

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

export {
    OnSched,
    OnSchedHelpers,
    OnSchedTemplates,
    OnSchedRest
}
