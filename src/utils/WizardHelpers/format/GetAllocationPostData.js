export const GetAllocationPostData = formElements => {
  try {
      var date = new Date().toISOString().slice(0, 10);

      var defaultData = {
          locationId: '',
          resourceId: '',
          startDate: date,
          endDate: date,
          startTime: 900,
          endTime: 1700,
          reason: '',
          bookingLimit: 0,
          allDay: false,
          repeats: false,
          repeat: {
              frequency: 'D',
              interval:  1,
              weekdays:  '',
              monthDay:  date.slice(-2),
              monthType: 'D'
            },
      }

      var postData = defaultData;

      for (var i = 0;i < formElements.length;i++) {
          var formEl = formElements[i];
          
          var value = formEl.value;
          if (formEl.type === 'checkbox') {
              value = formEl.checked;
          }

          // Change monthDay with startDate
          if (formEl.name === 'startDate') {
              postData.repeat.monthDay = value.slice(-2);
          }
          
          if (formEl.dataset.post) {
              if (formEl.dataset.post === 'root') {
                  postData[formEl.name] = value;
                  if (formEl.type === 'checkbox') {
                      postData[formEl.name] = value;
                  }
              }
              else if (formEl.dataset.post === 'repeat') {
                  postData.repeat[formEl.name] = value;
              }
          }
      }

      return postData;     
  
  } catch(e) {
      // TODO - raise error event to the app client
      console.log("GetAllocationPostData failed");
      console.log(e);        
  }
}
