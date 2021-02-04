javascript: try {
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

  const supportCount = calculateSupport();
  console.log(supportCount);

  if ($("#result_box").length <= 0) {
    $(generateOutput(supportCount)).insertAfter($("#overview_menu"));
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

///////////////////////////////////
// Logic functions
///////////////////////////////////
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
  const tribeless = {}; //players without tribes - todo
  const barbs = { totalUnits: {}, villages: {} }; //support in barbs - todo
  const own = { totalUnits: {}, villages: {} }; //your own villages

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
    const villgeName = $(village).text(); //todo delete
    const villageName = $(village).text();

    if (!villgeName) return;

    if (!playerName) {
      if (!own.villages[villgeName]) {
        own.villages[villgeName] = {};
      }
    } else {
      if (!tribes[tribeName]) {
        tribes[tribeName] = {
          totalUnits: {},
          players: {},
        };
      }

      if (!tribes[tribeName].players[playerName]) {
        tribes[tribeName].players[playerName] = {
          totalUnits: {},
          villages: {},
        };
      }

      if (!tribes[tribeName].players[playerName].villages[villgeName]) {
        tribes[tribeName].players[playerName].villages[villgeName] = {};
      }
    }

    //units
    for (let i = 1; i < rowData.length; i++) {
      const unitName = game_data.units[i - 1];
      const unitCount = parseInt($(rowData[i]).text());

      if (!playerName) {
        if (!own.totalUnits[unitName]) {
          own.totalUnits[unitName] = 0;
        }

        if (!own.villages[villageName][unitName]) {
          own.villages[villageName][unitName] = 0;
        }

        own.totalUnits[unitName] += unitCount;
        own.villages[villageName][unitName] += unitCount;
      } else {
        if (!tribes[tribeName].totalUnits[unitName]) {
          tribes[tribeName].totalUnits[unitName] = 0;
        }

        if (!tribes[tribeName].players[playerName].totalUnits[unitName]) {
          tribes[tribeName].players[playerName].totalUnits[unitName] = 0;
        }

        if (
          !tribes[tribeName].players[playerName].villages[villageName][unitName]
        ) {
          tribes[tribeName].players[playerName].villages[villageName][
            unitName
          ] = 0;
        }

        tribes[tribeName].totalUnits[unitName] += unitCount;
        tribes[tribeName].players[playerName].totalUnits[unitName] += unitCount;
        tribes[tribeName].players[playerName].villages[villageName][
          unitName
        ] += unitCount;
        /////////
      }
    }
  });

  console.log('Temp, until return object');
  console.log(own);
  return tribes;
}

// Common logic functions

///////////////////////////////////////////////////
// Custom UI functions
///////////////////////////////////////////////////
function outputUnits(unitsData) {
  let output = "";
  for (const unit in unitsData) {
    if (!unitsData[unit]) continue;
    output += `<span style="margin-right: 15px">${unit}: ${unitsData[unit]}</span>`;
  }

  return output;
}

function outputPlayerDetails(totalUnits, unitsPerVillage) {
  let detailedOutput = `<table class="vis" width="100%">
                            <tbody>
                                <tr class="nowrap">
                                    <td colspan="2" style="background-color: #fff5da">
                                        <div style="font-weight: bold;">Total Units (todo - pop):</div>
                                            ${outputUnits(totalUnits)}
                                    </td>
                                </tr>
                                ${unitsPerVillage}
                            </tbody>
                        </table>`;

  return detailedOutput;
}

function outputUnitsPerVillage(villages) {
  let villagesOutput = "";
  for (villageName in villages) {
    villagesOutput += `<tr class="nowrap">
                                    <td style="background-color: #fff5da">${villageName}</td>
                                    <td style="background-color: #fff5da">
                                    ${outputUnits(villages[villageName])}
                                    </td>
                                </tr>`;
  }

  return villagesOutput;
}

function outputTribeDetails(totalUnits, playersOutput) {
  output += `<tr>
                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${tribeName}</th>
                    <td>
                        <div style="font-weight: bold;">Total Units (todo - pop):</div>
                        ${outputUnits(totalUnits)}
                    </td>
                    <td>Withdraw</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">Units per Player (todo - pop):</div>
                        ${playersOutput}
                    </td>
                </tr>
    `;
}

function generateOutput(result) {
  let output = `<div id="result_box" style="margin-top: 15px">
                    <table class="vis" width="100%">
                        <thead>
                            <tr style=" text-align: center;">
                                <th>Tribe</th>
                                <th>Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        `;

  for (tribeName in result) {
    let playersOutput = "";
    for (playerName in result[tribeName].players) {
      let unitsPerVillage = outputUnitsPerVillage(
        result[tribeName].players[playerName].villages
      );

      let detailedOutput = outputPlayerDetails(
        result[tribeName].players[playerName].totalUnits,
        unitsPerVillage
      );

      playersOutput += outputExpandableWidget(
        "player_" + playerName,
        playerName,
        detailedOutput,
        false
      );
    }

    output += `<tr>
                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${tribeName}</th>
                    <td>
                        <div style="font-weight: bold;">Total Units (todo - pop):</div>
                        ${outputUnits(result[tribeName].totalUnits)}
                    </td>
                    <td>Withdraw</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">Units per Player (todo - pop):</div>
                        ${playersOutput}
                    </td>
                </tr>
    `;
  }

  output += `</tbody>
        </table>`;

  return output;
}

///////////////////////////////////
// Common UI functions
///////////////////////////////////
function toggleWidget(id, img) {
  console.log(id);
  const imgSrc = $(img).attr("src");

  if (imgSrc === "graphic/minus.png") {
    $(`#${id} div.widget_content`).hide();
    $(img).attr("src", "graphic/plus.png");
  } else {
    $(`#${id} div.widget_content`).show();
    $(img).attr("src", "graphic/minus.png");
  }
}

function outputExpandableWidget(id, heading, content, expanded = true) {
  let imagePath = expanded ? "graphic/minus.png" : "graphic/plus.png";
  let widgetContentStyle = expanded ? "display: block" : "display: none";

  let output = `<div id="${id}" class="vis moveable widget " style="margin: 5px;">
    <h4 class="head with-button ui-sortable-handle" style="padding: 3px;">
        <img style="float:right" class="widget-button" onclick="return toggleWidget( '${id}', this );"
            src="${imagePath}"> ${heading}
    </h4>
            <div class="widget_content" style="${widgetContentStyle}">${content}</div>
        </div>
    `;

  return output;
}

void 0;
