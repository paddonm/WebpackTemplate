export const GetResourcePostData = (formElements, element) => {
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
