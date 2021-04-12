export const CreateAllocation = (element, response) => {
  var elAllocationSetup = document.getElementById(element.id);

  if (response.error) {
      console.log("Rest error response code=" + response.code);
      console.log(response.data);
      
      var errorEvent = new CustomEvent("allocationSetupError", { detail: response });
      elAllocationSetup.dispatchEvent(errorEvent);    
  }

  var confirmationEvent = new CustomEvent("allocationSetupComplete", { detail: response });
  elAllocationSetup.dispatchEvent(confirmationEvent);    
}


export const ModifyAllocation = (element, response) => {
  var elAllocationSetup = document.getElementById(element.id);

  if (response.error) {
      console.log("Rest error response code=" + response.code);
      console.log(response.data);
      
      var errorEvent = new CustomEvent("allocationSetupError", { detail: response });
      elAllocationSetup.dispatchEvent(errorEvent);    
  }

  var confirmationEvent = new CustomEvent("allocationSetupComplete", { detail: response });
  elAllocationSetup.dispatchEvent(confirmationEvent);    
}

export const AllocationsList = (element, response) => {
  var elAllocations = document.getElementById(element.id);

  var htmlAllocations = OnSchedTemplates.allocationsList(response);
  elAllocations.innerHTML = htmlAllocations;
  
  // fire a custom event here
  var getAllocationsEvent = new CustomEvent("getAllocations", { detail: response });
  elAllocations.dispatchEvent(getAllocationsEvent);
}

export const GetAllocation = (element, response) => {
  console.log('consumer allocations GetAllocation', element, response)
  // fire a custom event here
  var getAllocationsEvent = new CustomEvent("getAllocation", { detail: response });
  elAllocations.dispatchEvent(getAllocationsEvent);
}
