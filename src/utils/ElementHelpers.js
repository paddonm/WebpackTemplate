// Initialize OnSched with clientId and environment 
var onsched = OnSched("sbox1621548569", "sbox");

// Get instance of elements to use for creating elements
var elements = onsched.elements();

export const createOnSchedElement = props =>
  elements.create(props.element, props.params, props.options);
