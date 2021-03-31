export const GetServicePostData = (formElements, element) => {

  try {

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
      var postData = { locationId: locationId, availability: businessHours, settings: {}, options: {} };

      for (var i = 0; i < formElements.length; i++) {

          // we must decorate the html elements with data-post attribute to populate input model of API
          var e = formElements[i];

          switch(e.dataset.post) {
              case undefined:
                  // ignore fields without a data-post entry
                  break;
              case "root":
                  postData[e.name] = OnSchedHelpers.GetFormElementDataValue(e);
                  break;
              case "settings":
                  postData.settings[e.name] = OnSchedHelpers.GetFormElementDataValue(e);
                  break;
              case "options":
                  postData.options[e.name] = OnSchedHelpers.GetFormElementDataValue(e);
                  break;
              case "businessHours":
                  var bhDay = e.name.substr(0, 3);
                  var bhTime = e.name.substr(3);
                  if (bhTime.includes("Start"))
                      postData.availability[bhDay].startTime = e.value;
                  else
                      postData.availability[bhDay].endTime = e.value;
                  break;                    
              default:
                  console.log(e.dataset.post + " " + e.name + " unrecognizable put attribute");
                  break;
          }
      }
      console.log(postData);
      return postData;     
  
  } catch(e) {
      // TODO - raise error event to the app client
      console.log("GetServicePostData failed");
      console.log(e);        
  }
}
