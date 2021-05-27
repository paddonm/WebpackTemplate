import { checkParam,
         formatEscapeSequences } from '../../utils/FormatHelpers'


export const availabilityTemplate = (response, service) => {
  // Array from media url comma separated
  let media = service.mediaPageUrl.replace(' ', '').split(',');

  return `
    <div class="availability-service">
      <h1>${checkParam(service.name)}</h1>
      <img class="main-img" src="${checkParam(service.imageUrl)}" alt="" /> 
      <div class="media-carousel">
        ${media.map(mediaImg => 
          `<img src="${checkParam(mediaImg)}" alt="" />`
        ).join("")}
      </div>
      <div class="price-description">
        <h5>From USD</h5>
        ${(service.feeAmount).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
        <ul>
          <li><b>Duration: </b></li>
          <li><b>Duration: </b></li>
        </ul>
      </div>
      <p>${checkParam(formatEscapeSequences(service.description))}<p/>
    </div>
  `
}
