import { Timezones,
         timesContainer,
         availableTimes,
         availableTimes2,
         calendarSelector,
         weeklyDateSelector,
         availabilityContainer,
         TimezoneSelectOptions,
         calendarSelectorFromDate } from './templates/availability'
import { servicesList,
         serviceSetup,
         timeIntervals }            from './templates/services'
import { resourcesList, 
         resourceSetup }            from './templates/resources'
import { searchForm,
         locationSetup,
         locationsList,
         businessHoursTable }       from './templates/locations'
import { errorBox,
         bookingForm,
         bookingFields,
         appointmentsList,
         appointmentSearchForm }    from './templates/appointments'
import { appointmentsModal }        from './templates/modals'
import { allocationsList, 
         allocationSetup }          from './templates/allocations'
import { wizardTitle,
         wizardSteps, 
         wizardSections }           from './templates/wizards'
import { listImage,
         circleIcon,
         inputField,
         selectField,
         previewImage,
         confirmation,
         popupFormHeader,
         stateSelectOptions,
         getTimeSelectedAttr,
         initTimesSelectData,
         resourceGroupOptions,
         initTimesSelectOptions,
         countrySelectOptions }     from './templates/miscellaneous'


export const OnSchedTemplates = {
  // availability
  availabilityContainer,
  calendarSelectorFromDate,
  calendarSelector,
  availableTimes,
  availableTimes2,
  timesContainer,  
  Timezones,
  TimezoneSelectOptions,
  weeklyDateSelector, // unused - ask @JohnPaddon
  
  // services
  servicesList,
  serviceSetup,
  timeIntervals,

  // resources
  resourcesList,
  resourceSetup,

  // locations
  locationsList,
  locationSetup,
  searchForm,
  businessHoursTable,

  // appointments
  appointmentSearchForm,
  appointmentsList,
  bookingFields,
  bookingForm,
  errorBox,
  
  // modal
  appointmentsModal,
  
  // allocations
  allocationsList,
  allocationSetup,
  
  // wizard
  wizardSteps,
  wizardSections,
  wizardTitle,
  
  // misc
  listImage,
  circleIcon,
  inputField,
  selectField,
  previewImage,
  confirmation,
  popupFormHeader,
  stateSelectOptions,
  initTimesSelectData,
  getTimeSelectedAttr,
  resourceGroupOptions,
  countrySelectOptions,
  initTimesSelectOptions,
}
