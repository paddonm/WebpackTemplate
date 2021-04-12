import { ParseDate } from './FormatHelpers'

export const SundayDate = () => {
  var sundayDate = new Date(2020, 3-1, 1, 0, 0, 0); 
  return sundayDate;
}

export const CreateDateString = (date) => {
  var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  return dateString;
}

export function AvailableDay(date) {
    try {
        var today = new Date();
        var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0"+date.getDate()).slice(-2);
        this.date = dateString;
        this.closed = date < today ? true : false;
        this.available = date < today ? false : true;
        this.reasonCode = date < today ? 100 : 0;
        this.reason = date < today ? "Date in past" : "Day is available";
    } catch (e) {
        logException("AvailableDay", e);
    }
}

export const IsToday = (day, selectedDate) => {
    const today = new Date();
    var date = ParseDate(day.date);
    var isToday =
        date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear();
    return isToday ? "today" : "";
}


export const IsSelected = (day, selectedDate) => {
    var date = ParseDate(day.date);
    var isSelected =
        date.getDate() == selectedDate.getDate() &&
        date.getMonth() == selectedDate.getMonth() &&
        date.getFullYear() == selectedDate.getFullYear();
    return isSelected ? "selected" : "";
}

export const IsAvailable = (day) => {
    if (day.available)
        return "";
    else
        return "disabled=disabled";
}

export const FirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export const LastDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export const AddDaysToDate = (inputDate, days) => {
  var date = new Date(inputDate);
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
}

export const timeFromMilitaryTime = (time, locale) => {
    var hours = time / 100;
    var mins = time % 100;
    var timeDate = new Date(1960, 10-1, 30, hours, mins, 0);
    return timeDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
}

export const timeFromDisplayTime = displayTime => {
    var spaceIndex = displayTime.indexOf(" ");
    var time = displayTime.substr(0, spaceIndex);
    return time;
}
export const ampmFromDisplayTime = displayTime => {
    var spaceIndex = displayTime.indexOf(" ");
    var ampm = displayTime.substr(spaceIndex + 1);
    return ampm;
}

export const GetFirstCalendarDate = (date) => {
  // first get the beginning of month
  // then go backwards to sunday
  var firstDayOfMonth = FirstDayOfMonth(date);
  var dow = firstDayOfMonth.getDay();
  var weekStartDate = AddDaysToDate(firstDayOfMonth, -dow);
  return weekStartDate;
}

export const GetCalendarDays = (date) => {
  var totalCalendarWeeks = GetCalendarWeeks(date);
  return totalCalendarWeeks * 7;
}

export const GetCalendarWeeks = (date) => {
  var firstDay = FirstDayOfMonth(date);
  var lastDay = LastDayOfMonth(date);

  var dow = firstDay.getDay();
  var displayableMonthDaysWeekOne = 7 - dow;
  var remainingDisplayableDays = lastDay.getDate() - displayableMonthDaysWeekOne;
  var remainingDisplayableWeeks = Math.floor(remainingDisplayableDays / 7) + (remainingDisplayableDays % 7 > 0 ? 1 : 0);
  var totalDisplayableWeeks = remainingDisplayableWeeks + 1;
  return totalDisplayableWeeks;
}

export const StartBookingTimer = (timerId, timerSelector, timerSecs) => {
  try {
      // Initialize here before timer kicks in
      if (OnSchedHelpers.IsEmpty(timerId) === false) {
          clearInterval(timerId);
          timerId = null;
      }
      // default to 2 mins
      timerSecs = timerSecs == null ? 120 : timerSecs;
      var today = new Date(); 
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(timerSecs);
      today.setMilliseconds(0);

      var options = { minute: "2-digit", second:"2-digit" };  
      var timerText = today.toLocaleTimeString("en-us", options);
      timerText += today.getMinutes() > 0 ? " mins" : " secs";
      if (today.getMinutes() > 0)
          timerText = timerText.replace(/^0+/, "");
      var elBookingTimer = document.querySelector(timerSelector);
      elBookingTimer.innerHTML = timerText;
      timerId = setInterval(
          function () {
              var mins = today.getMinutes();
              var secs = today.getSeconds();
              var elBookingTimer = document.querySelector(timerSelector);
              var timerText = today.toLocaleTimeString("en-us", { minute: "2-digit", second: "2-digit" });
              timerText += today.getMinutes() > 0 ? " mins" : " secs";
              if (today.getMinutes() > 0)
                  timerText = timerText.replace(/^0+/, "");
              elBookingTimer.innerHTML = timerText;
              mins = today.getMinutes();
              secs = today.getSeconds() - 1;
              today.setMinutes(secs > 60 ? mins - 1 : mins);
              today.setSeconds(secs > 60 ? 0 : secs);
              if (mins === 0 && secs === 0) {
                  clearInterval(timerId);
                  var elCloseBtn = document.querySelector(".onsched-close-btn");
                  elCloseBtn.click();
              }
          }, 1000);
      return timerId;
  } catch (e) {
      console.log("OnSchedHelpers.StartBookingTimer failed " + e.message);
//            OnSchedule.LogException(filename, "StartBookingTimer", e);
  }
} // StartBookingTimer
