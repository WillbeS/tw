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

function parseVillageData(villageData) {
  const [village, blank, player, tribe] = $(villageData)
    .find("span > a")
    .toArray();

  return {
    playerName: $(player).text(),
    tribeName: $(tribe).text() ? $(tribe).text() : "No Tribe",
    villageUrl: $(village).attr("href"),
    villageName: $(village).text(),
  };
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
    const { playerName, tribeName, villageUrl, villageName } = parseVillageData(
      $(rowData.shift())
    );

    if (!villageName) return;

    let tribe = null;
    let player = null;

    if (!playerName) {
      player = own;
    } else {
      if (!tribes[tribeName]) {
        tribes[tribeName] = {
          totalUnits: {},
          pop: 0,
          players: {},
        };
      }

      tribe = tribes[tribeName];

      if (!tribe.players[playerName]) {
        tribe.players[playerName] = {
          totalUnits: {},
          pop: 0,
          villages: {},
        };
      }

      player = tribe.players[playerName];
    }

    if (!player.villages[villageName]) {
      player.villages[villageName] = {
        units: {},
        pop: 0,
        url: villageUrl,
      };
    }

    village = player.villages[villageName];

    //units
    for (let i = 1; i < rowData.length; i++) {
      const unitName = game_data.units[i - 1];
      if (unitName === "militia") continue;

      const unitCount = parseInt($(rowData[i]).text());
      const unitPop = unitCount * getUnitPop(unitName);

      if (!player.totalUnits[unitName]) {
        player.totalUnits[unitName] = 0;
      }

      if (!village.units[unitName]) {
        village.units[unitName] = 0;
      }

      player.totalUnits[unitName] += unitCount;
      player.pop += unitPop;
      village.units[unitName] += unitCount;
      village.pop += unitPop;

      if (tribe) {
        if (!tribe.totalUnits[unitName]) {
          tribe.totalUnits[unitName] = 0;
        }
        tribe.totalUnits[unitName] += unitCount;
        tribe.pop += unitPop;
      }
    }
  });

  return { tribes, own };
}

void 0;
