javascript: try {
  const queryParams = getQueryParams(window.location.href);
  const correctUrl =
    "overview_villages&mode=units&type=away_detail&filter_villages=1&page=-1";

  if (
    queryParams.screen !== "overview_villages" ||
    queryParams.mode !== "units" ||
    queryParams.type !== "away_detail"
  ) {
    UI.InfoMessage("Going to the troops/support overview...", 3000, "success");
    window.location = `${game_data.link_base_pure}${correctUrl}`;
  } else {
    const data = calculateSupport();
    console.log(data);
    // if ($("#result_box").length <= 0) {
    //   $(generateOutput(data)).insertAfter($("#overview_menu"));
    // }
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  console.log(objError);
  alert(dbgMsg);
}

function getUnitPop(unit) {
  switch (unit) {
    case "spy":
      return 2;
    case "light":
      return 4;
    case ("marcher", "ram"):
      return 5;
    case "heavy":
      return 6;
    case "catapult":
      return 8;
    case "snob":
      return 100;
    default:
      return 1;
  }
}

function getUnitName(unit) {
  if (unit === "spy") return "Scout";
  if (unit === "marcher") return "M. Archer";
  if (unit === "snob") return "Noble";

  return unit.charAt(0).toUpperCase() + unit.slice(1);
}

function getQueryParams(url) {
  const urlParts = url.split("?");
  let queryParams = {};
  if (urlParts.length === 2) {
    urlParts[1].split("&").forEach((qs) => {
      [param, value] = qs.split("=");
      queryParams[param] = value;
    });
  }

  return queryParams;
}

function calculateSupport() {
  const tribes = {};
  const barbs = { totalUnits: {}, villages: {} };
  const own = { totalUnits: {}, pop: 0, villages: {} };

  const tableRows = $("#units_table").find("tbody tr");

  tableRows.each((i, row) => {
    if ($(row).hasClass("units_away")) {
      return;
    }

    const rowData = $(row).find("td").toArray();
    const villageData = $(rowData.shift());

    const [village, blank, player, tribe] = $(villageData)
      .find("span > a")
      .toArray();

    const playerName = $(player).text();
    const tribeName = $(tribe).text();
    const villageUrl = $(village).attr("href");
    const villageName = $(village).text();

    if (!villageName) return;

    if (!playerName) {
      if (!own.villages[villageName]) {
        own.villages[villageName] = {
          units: {},
          pop: 0,
          url: villageUrl,
        };
      }
    } else {
      if (!tribes[tribeName]) {
        tribes[tribeName] = {
          totalUnits: {},
          pop: 0,
          players: {},
        };
      }

      if (!tribes[tribeName].players[playerName]) {
        tribes[tribeName].players[playerName] = {
          totalUnits: {},
          pop: 0,
          villages: {},
        };
      }

      if (!tribes[tribeName].players[playerName].villages[villageName]) {
        tribes[tribeName].players[playerName].villages[villageName] = {
          units: {},
          pop: 0,
          url: villageUrl,
        };
      }
    }

    //units
    for (let i = 1; i < rowData.length; i++) {
      const unitName = game_data.units[i - 1];
      if (unitName === "militia") continue;

      const unitCount = parseInt($(rowData[i]).text());
      const unitPop = unitCount * getUnitPop(unitName);

      if (!playerName) {
        if (!own.totalUnits[unitName]) {
          own.totalUnits[unitName] = 0;
        }

        if (!own.villages[villageName].units[unitName]) {
          own.villages[villageName].units[unitName] = 0;
        }

        own.totalUnits[unitName] += unitCount;
        own.pop += unitPop;
        own.villages[villageName].units[unitName] += unitCount;
        own.villages[villageName].pop += unitPop;
      } else {
        if (!tribes[tribeName].totalUnits[unitName]) {
          tribes[tribeName].totalUnits[unitName] = 0;
        }

        if (!tribes[tribeName].players[playerName].totalUnits[unitName]) {
          tribes[tribeName].players[playerName].totalUnits[unitName] = 0;
        }

        if (
          !tribes[tribeName].players[playerName].villages[villageName].units[
            unitName
          ]
        ) {
          tribes[tribeName].players[playerName].villages[villageName].units[
            unitName
          ] = 0;
        }

        tribes[tribeName].totalUnits[unitName] += unitCount;
        tribes[tribeName].players[playerName].totalUnits[unitName] += unitCount;
        tribes[tribeName].players[playerName].villages[villageName].units[
          unitName
        ] += unitCount;
      }
    }
    ///////////////////////
  });

  return { tribes, own };
}

void 0;
