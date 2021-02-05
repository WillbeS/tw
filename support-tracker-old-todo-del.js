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
        drawPlayerDetails(player.totalUnits, player.villages)
      );
    }

    tribeRows += drawTribeRow(
      tribeName,
      drawUnits(tribe.totalUnits),
      playerDetails
    );
  }

  const tribesTable = drawTable(["Tribe", "Details", "Action"], tribeRows);
  const ownDetails = drawPlayerDetails(data.own.totalUnits, data.own.villages);

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

function drawTribeRow(tribeName, totalUnits, players) {
  return `<tr>
                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${tribeName}</th>
                    <td>
                        <div style="font-weight: bold;">Total Units (todo - pop):</div>
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

function drawPlayerDetails(totalUnits, villages) {
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
                                        <div style="font-weight: bold;">Total Units (todo - pop):</div>
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
