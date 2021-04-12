export const SelectOptionMatchingData = (selector, attr, value) => {
  Array.from(document.querySelector(selector).options).forEach(function(option) {
      if (option.dataset[attr] == value) {
          // now select this option
          option.selected = true;
      }
  
  });
}
