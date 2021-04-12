export const GetLocationPutData = formElements => {
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
