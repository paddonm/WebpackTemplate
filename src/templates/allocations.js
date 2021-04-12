import { OnSchedHelpers }   from '../utils/OnSchedHelpers'
import { OnSchedTemplates } from '../OnSchedTemplates'


export const allocationsList = response => {
  const tmplAllocations = `
      <div class="onsched-container">
          <div class="onsched-row">
              <div class="onsched-col">
                  <div class="onsched-list">
                      <table class="onsched-table">
                          <tbody>
                              <tr>
                                  <th>Repeats</th>
                                  <th>From</th>
                                  <th>To</th>
                                  <th>Effective</th>
                                  <th>Booking Limit</th>
                                  <th>Resource</th>
                                  <th>Reason</th>
                              </tr>
                              ${response.data.map((allocation, index) => {
                                  let repeats = 'Never';

                                  if (allocation.repeats) {
                                      switch (allocation.repeat.frequency) {
                                          case 'D':
                                              repeats = 'Daily';
                                              break;
                                          case 'W': 
                                              repeats = 'Weekly';
                                              break;
                                          case 'M':
                                              repeats = 'Monthly';
                                              break;
                                          default:
                                              repeats = 'Never';
                                      }
                                  }
                          
                                  return (
                                      `<tr key="${index}">
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${repeats}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${OnSchedHelpers.timeFromMilitaryTime(allocation.startTime, "en-US")}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${OnSchedHelpers.timeFromMilitaryTime(allocation.endTime, "en-US")}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${allocation.startDate} until ${allocation.endDate}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${allocation.bookingLimit}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${allocation.resourceName}
                                          </td>
                                          <td 
                                              class="list-item info-col" 
                                              data-id=${allocation.id} 
                                              data-element="allocations">${allocation.reason}
                                          </td>
                                      </tr>`
                                  )
                              }
                              ).join("")}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
  `;
  return tmplAllocations;
}

export const allocationSetup = (element, data) => {
    var times = OnSchedTemplates.initTimesSelectData("en-US").map(time => 
        `<option key="${time[0]}" value="${time[0]}">${time[1]}</option>`
    );

    const checkFrequency = frequency => {
        if (!data.repeat) return false
        return OnSchedHelpers.DataValue(data.repeat.frequency) === frequency
    }

    const tmplAllocationSetup = `
    <div class="onsched-container">
        <form class="onsched-wizard onsched-form" name="allocationSetup">
            <input type="hidden" name="step" value="0" />
            <h1>Allocation Setup</h1>

            <div class="onsched-wizard-section">
                <h2>Add Event</h2>
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="startDate">Starting</label>
                        <input id="startDate" type="date" name="startDate"  value="${OnSchedHelpers.DataValue(data.startDate)}" required="required" data-post="root" />
                    </div>
                    <div class="onsched-form-col">
                        <label for="endDate">Ending</label>
                        <input id="endDate" type="date" name="endDate"  value="${OnSchedHelpers.DataValue(data.endDate)}" required="required" data-post="root" />
                    </div>
                </div> 
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="startTime">At</label>
                        <select id="startTime" class="onsched-select" name="startTime" value="${OnSchedHelpers.DataValue(data.startTime)}" data-post="root">
                            ${times}
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="endTime">At</label>
                        <select id="endTime" class="onsched-select" name="endTime" value="${OnSchedHelpers.DataValue(data.endTime)}" data-post="root">
                            ${times}
                        </select>
                    </div>
                </div> 
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="resourceId">Resource</label>
                        <select id="resourceId" class="onsched-select" name="resourceId" value="${OnSchedHelpers.DataValue(data.resourceId)}" data-post="root">
                            <option />
                        </select>
                    </div>
                    <div class="onsched-form-col">
                        <label for="bookingLimit">Booking Limit</label>
                        <input id="bookingLimit" type="number" name="bookingLimit"  value="${OnSchedHelpers.DataValue(data.bookingLimit)}" data-post="root" />
                    </div>
                </div> 
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="reason">Reason</label>
                        <input id="reason" type="text" name="reason"  value="${OnSchedHelpers.DataValue(data.reason)}" data-post="root" />
                    </div>
                </div> 
                <div class="onsched-form-row">
                    <div class="onsched-form-col">
                        <label for="repeats">
                            <input id="repeats" type="checkbox" name="repeats" ${OnSchedHelpers.CheckboxChecked(OnSchedHelpers.DataValue(data.repeats))} data-post="root" data-type="bool" />
                            Repeats
                        </label>
                    </div>
                </div> 
                <div id="repeat-object" style="${data.repeats ? '' : 'display:none;'}">
                    <div class="onsched-form-row">
                        <div class="onsched-form-col">
                            <label for="frequency">Repeat</label>
                            <select id="frequency" class="onsched-select" name="frequency" value="${data.repeat ? OnSchedHelpers.DataValue(data.repeat.frequency) : 'D'}" data-post="repeat">
                                <option value="D" ${checkFrequency("D") ? 'selected' : ''} >Daily</option>
                                <option value="W" ${checkFrequency("W") ? 'selected' : ''} >Weekly</option>
                                <option value="M" ${checkFrequency("M") ? 'selected' : ''} >Monthly</option>
                            </select>
                        </div>
                        <div class="onsched-form-col">
                            <label for="interval">Every</label>
                            <div>
                                <select id="interval" class="onsched-select" name="interval" value="${data.repeat ? OnSchedHelpers.DataValue(data.repeat.interval) : '1'}" data-post="repeat">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                                <span id="dwm-switch">day(s)</span>
                            </div>
                        </div>
                    </div>
                    <div class="onsched-form-row" id="weekdays-row" style="${checkFrequency('W') ? '' : 'display:none;'}">
                        <div class="onsched-form-col">
                            <input id="weekdays" type="hidden" name="weekdays" value="${data.repeat ? OnSchedHelpers.DataValue(data.repeat.weekdays) : ''}" data-post="repeat" />
                            <label>Weekdays</label>
                            <div class="onsched-repeat-weekdays">
                            ${
                                ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((weekday, i) => 
                                    `<label for="repeat-weekly-${weekday}" class="${data.repeat && data.repeat.weekdays.includes(i.toString()) ? 'selected' : ''}">
                                        <input id="repeat-weekly-${weekday}" type="checkbox" name="repeat-weekly-${weekday}" ${data.repeat && OnSchedHelpers.CheckboxChecked(OnSchedHelpers.DataValue(data.repeat.weekdays.includes(i)))} data-type="bool" />
                                        ${weekday.slice(0,1)}
                                    </label>`
                                ).join("")
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>     

            <div class="onsched-wizard-nav">
                <div style="display:table-row">
                    <div class="onsched-wizard-nav-status">
                        <span class="step active"></span>
                    </div>
                    <div class="onsched-wizard-nav-buttons">
                        <button type="button" id="prevButton" class="prevButton">Previous</button>
                        <button type="submit" id="nextButton" class="nextButton">Next</button>
                    </div>
                </div>
            </div>
        </form>
    </div>        
    `;

    return tmplAllocationSetup;
}
