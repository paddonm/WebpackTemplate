export const wizardTitle = (title, data) => {
  const markup = `
      <div style="display:table;width:100%;">
          <div style="display:table-cell">
              <h1>${title}</h1>
          </div>
          <div style="display:table-cell;text-align:right;">
              <h4>${data.id == undefined || data.id.length == 0 ? "Create" : "Edit"} Mode</h4>
          </div>            
      </div>
  `;
  
  return markup;
}

export const wizardSections = () => {

  var locationSetupSections = [
      "generalInformation",
  ];

  var resourceSetupSections = [
      "generalInformation",
      "contactInformation",
      "address",
      "availability",
      "customFields",
  ];
  var wizardSections = [
      { "locationSetup": locationSetupSections },
      { "resourceSetup": resourceSetupSections },

  ];

  return wizardSections;
}

export const wizardSteps = wizardSections => {
  const tmplWizardSteps = `
  ${ wizardSections.map((wizardSection, index) =>
      ` <span class="step ${index > 0 ? "" : "active"}"></span>`        
  ).join("")}
  `;
  return tmplWizardSteps;
}
