import { AvailableTimes }    from './consumer/actions/availability'
import { AppointmentsList,
         CreateAppointment,
         BookAppointment }   from './consumer/actions/appointments'
import { GetLocation,
         LocationsList }     from './consumer/actions/locations'
import { GetService, 
         ServicesList }      from './consumer/actions/services'
import { GetResource, 
         ResourcesList }     from './consumer/actions/resources'
import { CreateCustomer }    from './consumer/actions/customers'

import { CreateResource, 
         ModifyResource }    from './setup/actions/resources'
import { CreateLocation, 
         ModifyLocation }    from './setup/actions/locations'
import { CreateService,
         ModifyService }     from './setup/actions/services'
import { CreateAllocation,
         ModifyAllocation,
         AllocationsList,
         GetAllocation }      from './setup/actions/allocations'

         
export const OnSchedResponse = {
  // Consumer Responses
  GetAvailability: AvailableTimes,
  GetAppointments: AppointmentsList,
  GetLocations:    LocationsList,
  GetLocation:     GetLocation,
  GetServices:     ServicesList,
  GetService:      GetService,
  GetResources:    ResourcesList,
  GetResource:     GetResource,
  GetCustomers:    CreateCustomer,
  GetAllocations:  AllocationsList,
  GetAllocation:   GetAllocation,
  
  // Setup Responses
  PostAppointment:    CreateAppointment,
  PutAppointmentBook: BookAppointment,
  PostLocation:       CreateLocation,
  PutLocation:        ModifyLocation,
  PostResource:       CreateResource,
  PutResource:        ModifyResource,
  PostService:        CreateService,
  PutService:         ModifyService,
  PostAllocation:     CreateAllocation,
  PutAllocation:      ModifyAllocation,
}

export default OnSchedResponse
