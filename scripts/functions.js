function getUnitName(unit) {
  if (unit === "spy") return "Scout";
  if (unit === "marcher") return "M. Archer";
  if (unit === "snob") return "Noble";

  return unit.charAt(0).toUpperCase() + unit.slice(1);
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

// HTML
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
