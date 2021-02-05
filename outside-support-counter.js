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

    if ($("#result_box").length <= 0) {
      $(generateOutput(data)).insertAfter($("#overview_menu"));
    }
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
    tribeName: $(tribe).text(),
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

function generateOutput(data) {
  console.log(data);
  tribeRows = "";
  for (tribeName in data.tribes) {
    const tribe = data.tribes[tribeName];
    tribeName = tribeName === "" ? "Tribeless" : tribeName;
    let playerDetails = "";
    let count = 0;
    for (playerName in tribe.players) {
      const player = tribe.players[playerName];
      playerDetails += drawExpandableWidget(
        `${playerName.replaceAll(/[^a-zA-Z\d_-]+/g, "")}_${++count}`,
        playerName,
        drawPlayerDetails(player.totalUnits, player.pop, player.villages)
      );
    }

    tribeRows += drawTribeRow(
      tribeName,
      drawUnits(tribe.totalUnits),
      tribe.pop,
      playerDetails
    );
  }

  const tribesTable = drawTable(["Tribe", "Details", "Action"], tribeRows);
  const ownDetails = drawPlayerDetails(
    data.own.totalUnits,
    data.own.pop,
    data.own.villages
  );

  return drawResultBox([
    drawExpandableWidget(
      "own_sup_table",
      "Support in your own villages",
      ownDetails
    ),
    drawExpandableWidget(
      "tribes_sup_table",
      "Support in other players villages",
      tribesTable
    ),
  ]);
}

/////////////////////////////////////////////////////////////////
// custom html
function drawUnits(units) {
  let output = "";
  for (const unit in units) {
    if (!units[unit]) continue;
    output += `<span style="margin-right: 15px">${unit}: ${units[unit]}</span>`;
  }

  return output;
}

function drawTribeRow(tribeName, totalUnits, pop, players) {
  return `<tr>
                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${tribeName}</th>
                    <td>
                        <div style="font-weight: bold;">Total Units (${pop} population):</div>
                        ${totalUnits}
                    </td>
                    <td>Withdraw</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">Units per Player (todo - pop):</div>
                        ${players}
                    </td>
                </tr>`;
}

function drawPlayerDetails(totalUnits, totalPop, villages) {
  let unitsPerVillage = "";
  for (villageName in villages) {
    unitsPerVillage += `<tr class="nowrap">
                                    <td style="background-color: #fff5da">
                                    <a href="${
                                      villages[villageName].url
                                    }">${villageName}</a>
                                    </td>
                                    <td style="background-color: #fff5da">
                                    ${drawUnits(villages[villageName].units)}
                                    </td>
                                </tr>`;
  }

  return `<table class="vis" width="100%">
                            <tbody>
                                <tr class="nowrap">
                                    <td colspan="2" style="background-color: #fff5da">
                                        <div style="font-weight: bold;">Total Units (${totalPop} population):</div>
                                            ${drawUnits(totalUnits)}
                                    </td>
                                </tr>
                                ${unitsPerVillage}
                            </tbody>
                        </table>`;
}

/////////////////////////////////////////////////////////////////
// html templates
function drawTable(headData, rows) {
  headData = headData.map((hd) => `<th>${hd}</th>`).join("");

  return `<table class="vis" width="100%">
                        <thead>
                            <tr style=" text-align: center;">
                                ${headData}
                            </tr>
                        </thead>
                    <tbody>${rows}</tbody>
        </table>`;
}

function drawResultBox(content) {
  content = content.join("");
  return `<div id="result_box" style="margin-top: 15px">${content}</div>`;
}

/////////////////////////////////////////////////////////////////
// Dynamic templates
function onToggleWidget(id, img) {
  const imgSrc = $(img).attr("src");
  if (imgSrc === "graphic/minus.png") {
    $(`#${id} > div.widget_content`).hide();
    $(img).attr("src", "graphic/plus.png");
  } else {
    $(`#${id} > div.widget_content`).show();
    $(img).attr("src", "graphic/minus.png");
  }
}

function drawExpandableWidget(id, heading, content, expanded = false) {
  let imagePath = expanded ? "graphic/minus.png" : "graphic/plus.png";
  let widgetContentStyle = expanded ? "display: block" : "display: none";

  let output = `<div id="${id}" class="vis moveable widget " style="margin: 5px;">
    <h4 class="head with-button ui-sortable-handle" style="padding: 4px 3px 4px 15px;">
        <img style="float:right" class="widget-button" onclick="return onToggleWidget( '${id}', this );"
            src="${imagePath}"> ${heading}
    </h4>
            <div class="widget_content" style="${widgetContentStyle}">${content}</div>
        </div>
    `;

  return output;
}

void 0;
