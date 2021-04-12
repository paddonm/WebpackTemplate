import { WizardSubmitHandler }     from '../WizardSubmitHandler'
import { WizardPrevHandler }       from '../WizardPrevHandler'
import { UpdateBusinessHoursTime } from '../UpdateBusinessHoursTime'


export const InitWizardDomElements = element => {

  // Initialize DOM elements now that we have loaded the template

  // Initialize the steps from looking at DOM Sections loaded
  var elWizardSections = document.querySelectorAll(".onsched-wizard-section");
  var elWizardNavStatus = document.querySelector(".onsched-wizard-nav-status");
  console.log("elWizardSections.length="+elWizardSections.length);
  var wizardSections = [];
  for (var i=0; i < elWizardSections.length; i++) {
      var elWizardSection = elWizardSections[i];
      var sectionStyle = window.getComputedStyle(elWizardSection)
      console.log("display="+sectionStyle.display);
      wizardSections.push(sectionStyle.display);
  }
  elWizardNavStatus.innerHTML = OnSchedTemplates.wizardSteps(wizardSections);

  var elWizardForm = document.querySelector(".onsched-wizard.onsched-form");
  elWizardForm.addEventListener("submit", (event) => WizardSubmitHandler(event, element));
  var elPrevButton = document.querySelector(".onsched-wizard-nav-buttons .prevButton");
  elPrevButton.addEventListener("click", WizardPrevHandler);

  // This click handler focuses on actions for the business hours, and availability hours.
  // A click will either hide or show a dropdown menu

  elWizardForm.addEventListener("click", function (event) {
      if (event.target.classList.contains("onsched-dropdown-menu-button")) {
          // first clear any displayed dropdown menus
          var menus = document.querySelectorAll(".onsched-dropdown-menu");
          for (var i = 0; i < menus.length; i++) {
              menus[i].style.display = "none";
          }
          var menu = event.target.nextElementSibling;
          if (menu.style.display != "none")
              menu.style.display = "none";
          else
              menu.style.display = "block";
          event.preventDefault();
      }
      else
      if (event.target.classList.contains("onsched-dropdown-menu-item")) {
          // need to call logic to show hide start/end times info.
          var businessHoursDay = event.target.closest(".onsched-business-hours-day");
          var day = businessHoursDay.classList[businessHoursDay.classList.length - 1];

          var startTimeColClass = ".onsched-business-hours-row.start .onsched-business-hours-time" + "." + day;
          var startTimeCol = document.querySelector(startTimeColClass);
          UpdateBusinessHoursTime(startTimeCol, event.target.name);

          var endTimeColClass = ".onsched-business-hours-row.end .onsched-business-hours-time" + "." + day;
          var endTimeCol = document.querySelector(endTimeColClass);
          UpdateBusinessHoursTime(endTimeCol, event.target.name);

          var li = event.target.parentElement;
          var menu = li.parentElement;
          event.preventDefault();
          menu.style.display = "none";
      }
      else {
          // something else clicked
          // make all the drop-down-menu's hidden
          var menus = document.querySelectorAll(".onsched-dropdown-menu");
          for (var i = 0; i < menus.length; i++) {
              menus[i].style.display = "none";
          }
      }

      }, false); // end of onclick processing

}
