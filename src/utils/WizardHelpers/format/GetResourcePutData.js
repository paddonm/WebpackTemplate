export const GetResourcePutData = formElements => {
  try {

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
