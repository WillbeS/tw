function getServerTime() {
  var servertime = win.$("#serverTime").html().match(/\d+/g);
  var serverDate = win.$("#serverDate").html().match(/\d+/g);
  serverTime = new Date(
    serverDate[1] +
      "/" +
      serverDate[0] +
      "/" +
      serverDate[2] +
      " " +
      servertime.join(":")
  );

  return serverTime;
}


function getQueryParams(url) {
  const urlParts = url.split("?");
  let queryParams = {};
  if (urlParts.length === 2) {
    const queryStrings = urlParts[1].split("&").forEach((qs) => {
      [param, value] = qs.split("=");
      queryParams[param] = value;
    });
  }

  return queryParams;
}