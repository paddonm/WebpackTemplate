import { ResourcesElement }         from './consumer/mounts/resources'
import { LocationsElement,
         LocationSearchElement }    from './consumer/mounts/locations'
import { AppointmentsElement,
         AppointmentSearchElement } from './consumer/mounts/appointments'
import { ServicesElement }          from './consumer/mounts/services'
import { AvailabilityElement }      from './consumer/mounts/availability'
import { CustomerElement }          from './consumer/mounts/customers'
import { AppointmentElement }       from './consumer/mounts/appointments'
import { ConfirmationElement }      from './consumer/mounts/availability'

import { LocationElement,
         LocationSetupElement }     from './setup/mounts/locations'
import { ResourceElement, 
         ResourceSetupElement }     from './setup/mounts/resources'
import { ServiceElement,
         ServiceSetupElement }      from './setup/mounts/services'
import { AllocationsElement,
         AllocationSetupElement }   from './setup/mounts/allocations'

         
export const OnSchedMount = {
  // Consumer Elements
  SearchElement:            LocationSearchElement,
  LocationsElement:         LocationsElement,
  AppointmentsElement:      AppointmentsElement,
  AppointmentSearchElement: AppointmentSearchElement,
  ResourcesElement:         ResourcesElement,
  ServicesElement:          ServicesElement,
  AvailabilityElement:      AvailabilityElement,
  ConfirmationElement:      ConfirmationElement,
  CustomerElement:          CustomerElement,
  AppointmentElement:       AppointmentElement,
  
  // Setup Elements
  LocationElement:        LocationElement,
  LocationSetupElement:   LocationSetupElement,
  ResourceSetupElement:   ResourceSetupElement,
  ResourceElement:        ResourceElement,
  ServiceElement:         ServiceElement,
  ServiceSetupElement:    ServiceSetupElement,
  AllocationsElement:     AllocationsElement,
  AllocationSetupElement: AllocationSetupElement,
}
