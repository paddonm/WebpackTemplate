import { checkParam } from '../../utils/FormatHelpers'

export const availabilityTemplate = (response, service) => {
  return `
    <div class="availability-service">
      <img src="${checkParam(service.imageUrl)}" alt="" /> 
      <h1>${checkParam(service.name)}</h1>
      <p>${checkParam(service.description)}<p/>
    </div>
  `
}
