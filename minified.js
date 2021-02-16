javascript: $.getScript(
  "https://willbes.github.io/tw/scripts/functions.js",
  run
);

function parseVillageData(villageData) {
  if (villageData.length === 0) return {};

  const [village, blank, player, tribe] = $(villageData)
    .find("span > a")
    .toArray();

  return {
    text: villageData.text(),
    playerName: $(player).text(),
    tribeName: $(tribe).text(),
    villageUrl: $(village).attr("href"),
    villageName: $(village).text(),
  };
}

function isBarb(text) {
  return text.search("(---)") !== -1;
}

function calculateSupport() {
  const players = { totalUnits: {}, pop: 0, tribes: {} };
  const barbs = { totalUnits: {}, pop: 0, villages: {} };
  const own = { totalUnits: {}, pop: 0, villages: {} };

  const tableRows = $("#units_table").find("tbody tr");

  tableRows.each((i, row) => {
    if ($(row).hasClass("units_away")) {
      return;
    }

    const rowData = $(row).find("td").toArray();
    const {
      text,
      playerName,
      tribeName,
      villageUrl,
      villageName,
    } = parseVillageData($(rowData.shift()));

    if (!villageName) return;

    let tribe = null;
    let player = null;

    if (!playerName) {
      player = isBarb(text) ? barbs : own;
    } else {
      if (!players.tribes[tribeName]) {
        players.tribes[tribeName] = {
          totalUnits: {},
          pop: 0,
          players: {},
        };
      }

      tribe = players.tribes[tribeName];

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
        if (!players.totalUnits[unitName]) {
          players.totalUnits[unitName] = 0;
        }
        if (!tribe.totalUnits[unitName]) {
          tribe.totalUnits[unitName] = 0;
        }
        players.totalUnits[unitName] += unitCount;
        tribe.totalUnits[unitName] += unitCount;
        tribe.pop += unitPop;
        players.pop += unitPop;
      }
    }
  });

  return { players, own, barbs };
}

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
        //$(generateOutput(data)).insertAfter($("#overview_menu"));
        $("#paged_view_content").prepend(generateOutput(data));
      }
    }
  } catch (objError) {
    var dbgMsg = "Error: " + String(objError.message || objError);
    console.log(objError);
    alert(dbgMsg);
  }
}
