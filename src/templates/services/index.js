import { MinutesToHours } from '../../utils/ConversionHelpers'

export const servicesTemplate = (response) => {
  var groups = response.data.map(service => service.serviceGroupName);
  let uniqGroups = [...new Set(groups)];
  console.log('services', response.data)
  return `
    <div class="row">
      <div class="col-12">
        <div class="list-group" id="list-tab" role="tablist">
          ${uniqGroups.map((group, i) => `
            <a 
              class="list-group-item list-group-item-action${i === 0 ? ' active' : ''}" 
              id="list-${group.replace(/\s/g, '')}-list" 
              data-toggle="list" 
              href="#list-${group.replace(/\s/g, '')}" 
              role="tab" 
              aria-controls="${group.replace(/\s/g, '')}"
            >
              ${group}
            </a>
          `).join("")}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="tab-content" id="nav-tabContent">
          ${uniqGroups.map((group, i) => 
            `
            <div 
              class="tab-pane fade show${i === 0 ? ' active' : ''}" 
              id="list-${group.replace(/\s/g, '')}" 
              role="tabpanel" 
              aria-labelledby="list-${group.replace(/\s/g, '')}-list"
            >
            ${response.data.filter(service => service.serviceGroupName === group).map(groupedService => `
              <div 
                class="service-item" 
                data-serviceid="${groupedService.id}"
              >
                <div class="service-details">
                  <img src="${groupedService.imageUrl}" />
                  <div>
                    <h1>${groupedService.name}</h1>
                    <p>${groupedService.description}</p>
                    <p><b>Duration:</b> ${MinutesToHours(groupedService.duration)} (approx.)</p>
                  </div>
                </div>
                <div class="book-service">
                  From USD
                  <h3>${(groupedService.feeAmount).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}</h3>
                  <button>Book Now</button>
                </div>
              </div>
            `).join("")}
            </div>`
          ).join("")}
        </div>
      </div>
    </div>
  `
}
