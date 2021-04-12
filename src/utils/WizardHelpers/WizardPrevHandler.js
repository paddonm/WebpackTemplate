import { ShowWizardSection } from './ShowWizardSection'


export const WizardPrevHandler = e => {
  var elStep = document.querySelector(".onsched-wizard input[name=step]")
  var step = parseInt(elStep.value);
  // update the new step value
  step = step - 1;
  elStep.value = step;
  ShowWizardSection(step);
  e.preventDefault();
}
