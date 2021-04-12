import { OnSchedRest } from '../../../OnSchedRest'

export const InitAllocationDomElements = (element, allocation) => {
  var url = element.onsched.apiBaseUrl + `/resources`;
  var elRepeatObj = document.getElementById('repeat-object');
  var elRepeats = document.getElementById('repeats');
  var elFrequency = document.getElementById('frequency');
  var weekdayInputs = document.querySelectorAll("input[id^='repeat-weekly-']");
  var elWeekdays = document.getElementById('weekdays');
  var elWeekdaysRow = document.getElementById('weekdays-row');
  var elDWMSwitch = document.getElementById('dwm-switch');
  var weekdays = elWeekdays.value.split("");

  elFrequency.onchange = e => {
      switch(e.target.value) {
          case 'D':
              elWeekdaysRow.style.display = 'none';
              elDWMSwitch.innerText = 'day(s)';
              break;
          case 'W':
              elWeekdaysRow.style.display = 'flex';
              elDWMSwitch.innerText = 'week(s)';
          break;
          case 'M':
              elWeekdaysRow.style.display = 'none';
              elDWMSwitch.innerText = 'month(s)';
              break;
          default:
      }
  }
  
  Array.from(weekdayInputs).map((input, i) => input.onchange = e => {
      e.target.parentElement.className = e.target.checked ? 'selected' : '';
      let idx = i.toString();
      
      if (weekdays.includes(idx)) {
          weekdays = weekdays.filter(w => w !== idx);
      }
      else {
          weekdays.push(idx);
      }
      
      elWeekdays.value = weekdays.join("");
  })


  elRepeats.onchange = e => {
      if (e.target.checked) {
          elRepeatObj.style.display = 'unset';
      }
      else {
          elRepeatObj.style.display = 'none';
      }
  }
  
  Object.entries(element.params).map(param => {
      url = OnSchedHelpers.AddUrlParam(url, param[0], param[1]) 
  })

  element.onsched.accessToken.then(x =>
      OnSchedRest.Get(x, url, function (response) {
          if (response.error) {
              console.log("Rest error response code=" + response.code);
          }
          else {
              var elResources = document.querySelector(".onsched-wizard.onsched-form select[name=resourceId]");
              const resourcesSelectList = `
                  <option value="">None</option>
                  ${response.data.map((resource) => 
                      `
                      <option value="${resource.id}" ${resource.id === allocation.resourceId ? 'selected' : ''}>${resource.name}</option>
                      `
                  ).join("")}
              `;
              elResources.innerHTML = resourcesSelectList;
              // template the resourcegroup select
          }
      }) // end rest response
  ); // end promise           
}
