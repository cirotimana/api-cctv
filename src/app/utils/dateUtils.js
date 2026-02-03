const moment = require("moment");


const format = (date) => {
  return  moment(date, "YYYY-MM-DD").startOf("day").format("YYYY-MM-DD HH:mm:ss");
};

const formatDateTime = (dateString, isEndOfDay = false) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const d = new Date(year, month - 1, day);

  if (isEndOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const formattedDate = d
    .toLocaleString("sv-SE", { timeZone: "America/Bogota" })
    .replace(" ", "T")
    .split("T");

  return `${formattedDate[0]} ${formattedDate[1]}.0000000 -05:00`;
};


module.exports = {
    format, formatDateTime
};
