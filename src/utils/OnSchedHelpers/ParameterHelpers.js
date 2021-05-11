import moment from 'moment'
import { OnSchedHelpers } from './index'

export const TemplateParameters = {
  ApptDate:                 'apptDate',
  ApptDescription:          'apptDescription',
  ApptTime:                 'apptTime',
  BusinessName:             'businessName',
  ConfirmationNumber:       'confirmationNumber',
  ApptTimeZone:             'apptTimeZone',
  ApptResource:             'apptResource',
  ApptLocation:             'apptLocation',
  ResourceName:             'resourceName',
  AddToCalendarUrl:         'downloadIcsUrlss',
  ServiceName:              'serviceName',
  PrivacyFields:            'PrivacyFields', // Custom param
  BookingFields:            'BookingFields', // Custom param
}

export const CustomTemplateParameters = response => {
  response.apptDate = moment(response.startDateTime).format('LLLL');
  response.apptDescription = response.duration + ' min - ' + response.resourceName;
  response.apptTime = OnSchedHelpers.FormatTime(response.time);
  response.apptTimeZone = response.timezone;
  response.apptResource = response.resourceId;
  response.apptLocation = response.location;


  return response;
}
