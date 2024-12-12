export const formatDate = (dateString, timeString = "") => {
  let date;

  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/"); 
    dateString = `${year}-${month}-${day}`; 
  }

  if (timeString) {
    date = new Date(`${dateString} ${timeString}`);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};
