export const UpdateBusinessHoursTime = (timeCol, action) => {
  var labelClosed = timeCol.getElementsByClassName("closed")[0];
  var selectTime = timeCol.getElementsByTagName("select")[0];
  if (action === "closed") {
      labelClosed.style.display = "block";
      if (selectTime.name.includes("Start") || selectTime.name.includes("End"))
          selectTime.value = "0";
  }
  else
      labelClosed.style.display = "none";
  var label24Hrs = timeCol.getElementsByClassName("hrs24")[0];
  if (action === "24hrs") {
      label24Hrs.style.display = "block";
      if (selectTime.name.includes("Start"))
          selectTime.value = "0";        
      if (selectTime.name.includes("End"))
          selectTime.value = "2400";        
  }
  else
      label24Hrs.style.display = "none";
  var selectTime = timeCol.getElementsByClassName("time")[0];
  if (action === "open")
      selectTime.style.display = "block";
  else
      selectTime.style.display = "none";
}
