javascript: $.getScript(
  "https://willbes.github.io/tw/scripts/functions.js",
  run
);

function drawPlayers(players) {
  if (players.pop === 0) {
    return `<tr><td style="text-align: center" colspan=2>You have 0 support</td></tr>`;
  }
  tribeRows = "";
  for (tribeName in players.tribes) {
    const tribe = players.tribes[tribeName];

    tribeName = tribeName === "" ? "Tribeless" : tribeName;
    let playerDetails = "";
    let count = 0;
    for (playerName in tribe.players) {
      const player = tribe.players[playerName];
      playerDetails += drawExpandableWidget(
        `${playerName.replaceAll(/[^a-zA-Z\d_-]+/g, "")}_${++count}`,
        `${playerName} (${player.pop} population)`,
        drawPlayerDetails(player.totalUnits, player.pop, player.villages)
      );
    }

    tribeRows += drawTribe(
      tribeName,
      drawUnits(tribe.totalUnits),
      tribe.pop,
      playerDetails
    );
  }

  return tribeRows;
}

function generateOutput(data) {
  console.log(data);
  const tribesTable = drawTable(
    ["Tribe", "Details"],
    drawPlayers(data.players)
  );
  const ownDetails = drawPlayerDetails(
    data.own.totalUnits,
    data.own.pop,
    data.own.villages
  );
  const barbsDetails = drawPlayerDetails(
    data.barbs.totalUnits,
    data.barbs.pop,
    data.barbs.villages
  );

  return drawResultBox([
    drawExpandableWidget(
      "own_sup_table",
      `Support in your own villages (${data.own.pop} population)`,
      ownDetails
    ),
    drawExpandableWidget(
      "tribes_sup_table",
      `Support in other players villages (${data.players.pop} population)`,
      tribesTable
    ),
    drawExpandableWidget(
      "barbs_sup_table",
      `Support in barbarian villages (${data.barbs.pop} population)`,
      barbsDetails
    ),
  ]);
}

// custom html
function drawUnits(units) {
  let output = "";
  for (const unit in units) {
    if (!units[unit]) continue;
    output += `<span style="margin-right: 15px">
    ${getUnitName(unit)}: ${units[unit]}
    </span>`;
  }

  return output;
}

function drawTribe(tribeName, totalUnits, pop, players) {
  return `<tr>
                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${tribeName}</th>
                    <td>
                        <div style="font-weight: bold;">Total Units (${pop} population):</div>
                        ${totalUnits}
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="font-weight: bold;">Units per Player:</div>
                        ${players}
                    </td>
                </tr>`;
}

function drawVillage(villageName, villageData) {
  return `<tr class="nowrap">
            <td style="background-color: #fff5da; padding-left: 30px;">
                <a href="${villageData.url}">
                    ${villageName}
                </a>
            </td>
        </tr>
        <tr class="nowrap">
            <td colspan="2" style="background-color: #fff5da; padding-left: 60px; font-style: italic; font-size: 96%; padding-bottom: 6px">
                ${drawUnits(villageData.units)}
                <span style="margin-left: 10px; font-weight: bold;">
                    (${villageData.pop} pop)
                </span>
            </td>
        </tr>`;
}

function drawPlayerDetails(totalUnits, totalPop, villages) {
  if (totalPop === 0) {
    return `<div style="text-align: center; background-color: #f4e4bc; padding: 2px 3px">You have 0 support</div>`;
  }
  let villagesHTML = "";
  for (villageName in villages) {
    villagesHTML += drawVillage(villageName, villages[villageName]);
  }

  return `<table class="vis" width="100%">
            <tbody>
                <tr class="nowrap" style="margin-bottom:10px;">
                    <td style="background-color: #FADC9B; font-weight:bold">
                        <div style="font-weight: bold;">Total Units:</div>
                        ${drawUnits(totalUnits)}
                    </td>
                </tr>
                ${villagesHTML}
            </tbody>
        </table>`;
}

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

function run() {
  try {
    const queryParams = getQueryParams(window.location.href);
    const correctUrl =
      "overview_villages&mode=units&type=away_detail&filter_villages=1&page=-1";

    if (
      queryParams.screen !== "overview_villages" ||
      queryParams.mode !== "units" ||
      queryParams.type !== "away_detail"
    ) {
      UI.InfoMessage(
        "Going to the troops/support overview...",
        3000,
        "success"
      );
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
}
