export const GetServicePutData = formElements => {
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

      var putData = { availability: availability, settings: {}, options: {}, fees: {} };
      for (var i = 0; i < formElements.length; i++) {
          var e = formElements[i];
          switch(e.dataset.post) {
              case undefined:
                  // ignore fields without a data-post entry
                  break;
              case "root":
                  putData[e.name] = e.dataset.type == "int" ? OnSchedHelpers.parseInt(e.value) : e.value;
                  putData[e.name] = e.dataset.type == "bool" ? e.checked : e.value;
                  break;
              case "settings":
                  putData.settings[e.name] = e.dataset.type == "int" ? OnSchedHelpers.ParseInt(e.value) : e.value;
                  putData.settings[e.name] = e.dataset.type == "bool" ? e.checked : e.value;
                  break;
              case "options":
                  putData.options[e.name] = e.dataset.type == "int" ? OnSchedHelpers.ParseInt(e.value) : e.value;
                  putData.options[e.name] = e.dataset.type == "bool" ? e.checked : e.value;                               
                  break;
              case "businessHours":
                  var bhDay = e.name.substr(0, 3);
                  var bhTime = e.name.substr(3);
                  if (bhTime.includes("Start"))
                      putData.availability[bhDay].startTime = e.value;
                  else
                      putData.availability[bhDay].endTime = e.value;
                  break;                   
              default:
                  console.log(e.dataset.post + " " + e.name + " unrecognizable put attribute");
                  break;
          }
      }
      console.log(putData);
      return putData;

  } catch(e) {
      // TODO - raise error event to the app client
      console.log("GetServicePutData failed");
      console.log(e);        
  }
}
