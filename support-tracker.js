javascript: function getQueryParams(url) {
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

try {
  const queryParams = getQueryParams(window.location.href);
  const correctUrl =
    "overview_villages&mode=units&type=away_detail&filter_villages=1";

  if (
    queryParams.screen !== "overview_villages" ||
    queryParams.mode !== "units" ||
    queryParams.type !== "away_detail"
  ) {
    console.log("redirect");
    UI.InfoMessage("Going to the troops/support overview...", 3000, "success");
    window.location = `${game_data.link_base_pure}${correctUrl}`;
  }

  // Real script
  const players = {};
  const tableRows = $("#units_table").find("tbody tr");

  console.log("Supporting village:");
  tableRows.each((i, row) => {
    if ($(row).hasClass("units_away")) {
      return;
    }

    const rowData = $(row).find("td").toArray();
    const villageTd = $(rowData.shift());
    //const villageText = villageTd.text().replace(/\s/g, " ");
    const [villageLink, blank, player, tribe] = $(villageTd)
      .find("span > a")
      .toArray();
    const playerName = $(player).text();

    if (!players[playerName]) {
      players[playerName] = {};
    }

    const villgeName = $(villageLink).text();
    if (!players[playerName][villgeName]) {
        players[playerName][villgeName] = {};
    }

    // const regexp = /.+\(\d{3}|\d{3}\).+\((.+)\)/g;
    // const match = regexp.exec(villageData);

    // if (match) {
    //   console.log(match[0]);
    // }

    //units
    for (let i = 0; i < rowData.length; i++) {}

    // rowData.each((i, td) => {
    //     //Village data
    //     console.log(td);

    // })

    // const villageLink = $(row).find("td > span > span > a");
    // console.log($(villageLink).attr("href"));
    // console.log($($(villageLink).find("span")[0]).html());
  });

  console.log(players);

  //unitImgs.each((i, v) => console.log(i));
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
