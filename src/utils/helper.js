const formatTo12Hour = (time) => {
  const date = time instanceof Date ? time : new Date(time);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatToDateAndTime = (time) => {
  const date = time instanceof Date ? time : new Date(time);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function formatDate(isoString, format = "DD/MM/YYYY") {
  const date = new Date(isoString);

  const map = {
    DD: String(date.getUTCDate()).padStart(2, "0"),
    MM: String(date.getUTCMonth() + 1).padStart(2, "0"),
    YYYY: date.getUTCFullYear(),
  };

  return format.replace(/DD|MM|YYYY/g, (match) => map[match]);
}

const getTodayDate = (type = "YYYY-MM-DD") => {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  switch (type) {
    case "YYYY-MM-DD":
      return local.toISOString().split("T")[0];
    case "YYYY-MM-DD HH:mm:ss":
      return local.toISOString();
    case "DD/MM/YYYY":
      return formatDate(local.toISOString(), type);
    case "DD/MM/YYYY HH:mm:ss":
      return formatDate(local.toISOString(), type);
    default:
      return local.toISOString().split("T")[0];
  }
};

export { formatTo12Hour, formatToDateAndTime, formatDate, getTodayDate };
