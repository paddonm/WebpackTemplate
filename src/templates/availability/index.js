import { checkParam,
         formatEscapeSequences } from '../../utils/FormatHelpers'
import { MinutesToHours }        from '../../utils/ConversionHelpers'


export const availabilityTemplate = (response, service) => {
  // Array from media url comma separated
  let media = service.mediaPageUrl.replace(' ', '').split(',');

  //Media Carousel

  // <div class="media-carousel">
  //   ${media.map(mediaImg => 
  //     `<img src="${checkParam(mediaImg)}" alt="" />`
  //   ).join("")}
  // </div>
  
  return `
    <div class="availability-service">
      <h1>${checkParam(service.name)}</h1>
      <img class="main-img" src="${checkParam(service.imageUrl)}" alt="" /> 
      <div class="price-description">
        <h5>From USD</h5>
        <h3>
          ${(service.feeAmount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </h3>
        <table>
          <tbody>
            <tr>
              <th>Duration:</th>
              <td>${MinutesToHours(service.duration)} (approx.)</td>
            </tr>
            <tr>
              <th>Per Group:</th>
              <td>${checkParam(service.maxGroupSize)} guests</td>
            </tr>
            <tr>
              <th>Max. Capacity:</th>
              <td>${checkParam(service.maxCapacity)} guests</td>
            </tr>
          </tobdy>
        </table>
      </div>
      <p>${checkParam(formatEscapeSequences(service.description))}<p/>
    </div>
  `
}
