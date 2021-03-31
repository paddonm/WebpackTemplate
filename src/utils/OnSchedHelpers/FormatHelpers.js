export const ParseDate = (dateString) => {
  var utcDate = new Date(Date.parse(dateString));
  var date = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
  return date;
}

export const ParseInt = (intString) => {
  if (intString == undefined || intString.length == 0)
      return 0;
  else
  if (isNaN(intString))
      return 0;
  else
      return parseInt(intString);
}

export const FormatServiceDescription = (response) => {
  var result = response.serviceName;
  result += " ";
  result += FormatDuration(response.serviceDuration);
  if (response.resourceName.length > 0)
      result += " - " + response.resourceName;
  return result;
}

export const FormatTime = (time) => {
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

export const FormatDuration = (duration) => {
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

export const FormatPhoneNumber = (ns) => {
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

export const ParsePhoneNumber = (strIn) => {
  if (strIn == undefined)
      return "";
  strIn = strIn.trim();

  var parsed = strIn.replace(/[^0-9]/g, '');
              
  return parsed.trim();
}
