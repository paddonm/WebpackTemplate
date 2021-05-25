export const MinutesToHours = minutes => {
  var time = minutes + ' mins';

  if (minutes >= 60) {
    time = `${parseInt(minutes / 60)} Hours`
    
    if (minutes % 60 > 0) {
      time += ` & ${minutes % 60} Mins`
    }
  }

  return time;
}
