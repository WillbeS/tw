javascript: function getQueryParams(url) {
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

function parseData() {
  const players = {};
  const unitsPerPlayer = {};
  const unitsPerTribe = {};
  const ownUnitsPerVillage = {};

  //new, will replace old when finsihed
  const outsideSupport = {};

  const tableRows = $("#units_table").find("tbody tr");

  tableRows.each((i, row) => {
    if ($(row).hasClass("units_away")) {
      return;
    }

    const rowData = $(row).find("td").toArray();
    const villageTd = $(rowData.shift());

    const [villageLink, blank, player, tribe] = $(villageTd)
      .find("span > a")
      .toArray();

    const playerName = $(player).text();
    const tribeName = $(tribe).text();
    const villgeName = $(villageLink).text();

    if (!playerName) {
      if (!villgeName) return;
      if (!ownUnitsPerVillage[villgeName]) {
        ownUnitsPerVillage[villgeName] = {};
      }
    } else {
      if (!unitsPerTribe[tribeName]) {
        unitsPerTribe[tribeName] = {};
      }

      if (!players[playerName]) {
        players[playerName] = {};
        unitsPerPlayer[playerName] = {};
      }

      if (!players[playerName][villgeName]) {
        players[playerName][villgeName] = {};
      }
    }

    //units
    for (let i = 1; i < rowData.length; i++) {
      const unitName = game_data.units[i - 1];

      if (!playerName) {
        if (!ownUnitsPerVillage[villgeName][unitName]) {
          ownUnitsPerVillage[villgeName][unitName] = 0;
        }

        ownUnitsPerVillage[villgeName][unitName] += Number(
          $(rowData[i]).text()
        );
      } else {
        if (!players[playerName][villgeName][unitName]) {
          players[playerName][villgeName][unitName] = 0;
        }

        if (!unitsPerPlayer[playerName][unitName]) {
          unitsPerPlayer[playerName][unitName] = 0;
        }

        if (!unitsPerTribe[tribeName][unitName]) {
          unitsPerTribe[tribeName][unitName] = 0;
        }

        players[playerName][villgeName][unitName] += Number(
          $(rowData[i]).text()
        );
        unitsPerPlayer[playerName][unitName] += Number($(rowData[i]).text());
        unitsPerTribe[tribeName][unitName] += Number($(rowData[i]).text());
      }
    }
  });

  return [players, unitsPerPlayer, unitsPerTribe, ownUnitsPerVillage];
}

//TODO...
function generateOutput() {
  let output = `<div style="text-align:center; margin-bottom: 10px;" id="result_box">
        <table id="own_support" style="padding:10px">
        <tr><th colspan="2">Own Villages</th></tr>
        <tr>
        </table>
        <div id="times_output"></div>
    </div>`;

  return output;
}

function unitsPerPlayerHTML(heading, unitsPerPlayer) {
  let output = "<div><h1>Units Per Player</h1>";

  output += "</div>";
  return output;
}

try {
  const queryParams = getQueryParams(window.location.href);
  const correctUrl =
    "overview_villages&mode=units&type=away_detail&filter_villages=1&page=-1";

  if (
    queryParams.screen !== "overview_villages" ||
    queryParams.mode !== "units" ||
    queryParams.type !== "away_detail"
  ) {
    console.log("redirect");
    UI.InfoMessage("Going to the troops/support overview...", 3000, "success");
    window.location = `${game_data.link_base_pure}${correctUrl}`;
  }

  const [
    unitsPerPlayerVillages,
    unitsPerPlayer,
    unitsPerTribe,
    ownUnitsPerVillage,
  ] = parseData();
  console.log(unitsPerPlayerVillages);
  console.log(unitsPerPlayer);
  console.log(unitsPerTribe);
  console.log(ownUnitsPerVillage);

  if ($("#result_box").length <= 0) {
    $(generateOutput()).insertAfter($("#overview_menu"));
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
