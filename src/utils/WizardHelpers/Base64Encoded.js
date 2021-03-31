export const Base64Encoded = img => {
  console.log("base64Encoded="+ img.width + " " + img.height);
  // Create canvas
  const canvas = document.createElement('canvas');
  // Set width and height
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');

  // Draw the image
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var dataUrl = canvas.toDataURL();
  var n = dataUrl.indexOf("base64,");
  if (n > 0)
      return dataUrl.substr(n+"base64,".length);
  else
      return dataUrl;
}
