import { OnSchedHelpers } from ".";

export const IsEmpty = val => {
  return (val === undefined || val == null || val.length <= 0) ? true : false;
}

export const IsNotEmpty = val => {
  return (val === undefined || val == null || val.length <= 0) ? false : true;
}

export const GetFunctionName = fun => {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

export const GetUrlParameter = name => {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export const CreateAvailabilityUrl = (baseUrl, params, date, tzOffset) => {
  var startDate = date == null ? params.date : date;
  var endDate = date == null ? params.date : date;
  var url = baseUrl;
  url += "/" + "availability";
  url += "/" + params.serviceId;
  url += "/" + OnSchedHelpers.CreateDateString(startDate);
  url += "/" + OnSchedHelpers.CreateDateString(endDate);

  tzOffset = IsEmpty(tzOffset) ? -startDate.getTimezoneOffset() : tzOffset;
//       element.params.tzOffset = OnSchedHelpers.IsEmpty(element.params.tzOffset) ? tzOffset : element.params.tzOffset;

  url = OnSchedHelpers.IsEmpty(params.locationId) ? url : AddUrlParam(url, "locationId", params.locationId);
//        url = OnSchedHelpers.IsEmpty(params.tzOffset) ? url : AddUrlParam(url, "tzOffset", params.tzOffset);
  url = AddUrlParam(url, "tzOffset", tzOffset);
  url = OnSchedHelpers.IsEmpty(params.resourceId) ? url : AddUrlParam(url, "resourceId", params.resourceId);
//        console.log("CreateAvailabilityUrl="+url)
  return url;
}

export const AddUrlParam = (url, name, value) => {
  if (value == undefined)
      return url;
  if (url.indexOf("?") !== -1)
      url += "&" + name + "=" + value;
  else
      url += "?" + name + "=" + value;
  return url;
}

export const GetFormElementDataValue = e => {
  if (e.dataset.type == "int")
      return OnSchedHelpers.ParseInt(e.value);
  else
  if (e.dataset.type == "bool")
      return e.checked;
  else
      return e.value;
}

export const DataValue = (value) => value === undefined ? "" : value;

export const CheckboxChecked = value => value ? "checked=\"checked\"" : "";
