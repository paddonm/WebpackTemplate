export const ShowWizardSection = step => {
  // hide all the steps then show current step
  var elWizardSections = document.querySelectorAll(".onsched-wizard .onsched-wizard-section");
  for (var i = 0; i < elWizardSections.length; i++) {
      elWizardSections[i].style.display = "none";
  }
  var stepInt = parseInt(step, 10);
  if (stepInt < 0 || stepInt >= elWizardSections.length) {
      stepInt = 0; // fail safe
      // update value in hidden field
      var elStep = document.querySelector(".onsched-wizard input[name=step]")
      elStep.value = 0;
  }
  var elWizardSection = elWizardSections[stepInt];

  if (stepInt == elWizardSections.length - 1) {
      var elNextButton = document.querySelector(".onsched-wizard-nav .onsched-wizard-nav-buttons .nextButton");
      elNextButton.innerHTML = "Finish";
  }
  else {
      var elNextButton = document.querySelector(".onsched-wizard-nav .onsched-wizard-nav-buttons .nextButton");
      elNextButton.innerHTML = "Next";
  }

  elWizardSection.style.display = "block";
  // remove the active step
  var elActiveStep = document.querySelector(".onsched-wizard-nav-status .active")
  elActiveStep.classList.remove("active");
  // set the new step active
  var elStepIndicators = document.querySelectorAll(".onsched-wizard-nav-status span")
  elStepIndicators[stepInt].classList.add("active");
  var elPrevButton = document.querySelector(".onsched-wizard-nav button.prevButton")
  if (stepInt == 0)
      elPrevButton.style.display = "none";
  else
      elPrevButton.style.display = "inline-block";
}
