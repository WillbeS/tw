javascript: try {
  const t = getQueryParams(window.location.href),
    e =
      "overview_villages&mode=units&type=away_detail&filter_villages=1&page=-1";
  if (
    "overview_villages" !== t.screen ||
    "units" !== t.mode ||
    "away_detail" !== t.type
  )
    UI.InfoMessage("Going to the troops/support overview...", 3e3, "success"),
      (window.location = `${game_data.link_base_pure}${e}`);
  else {
    const t = calculateSupport();
    $("#result_box").length <= 0 &&
      $(generateOutput(t)).insertAfter($("#overview_menu"));
  }
} catch (t) {
  var dbgMsg = "Error: " + String(t.message || t);
  console.log(t), alert(dbgMsg);
}
function getUnitPop(t) {
  switch (t) {
    case "spy":
      return 2;
    case "light":
      return 4;
    case "ram":
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
function getUnitName(t) {
  return "spy" === t
    ? "Scout"
    : "marcher" === t
    ? "M. Archer"
    : "snob" === t
    ? "Noble"
    : t.charAt(0).toUpperCase() + t.slice(1);
}
function getQueryParams(t) {
  const e = t.split("?");
  let a = {};
  return (
    2 === e.length &&
      e[1].split("&").forEach((t) => {
        ([param, value] = t.split("=")), (a[param] = value);
      }),
    a
  );
}
function parseVillageData(t) {
  if (0 === t.length) return {};
  const [e, a, n, r] = $(t).find("span > a").toArray();
  return {
    text: t.text(),
    playerName: $(n).text(),
    tribeName: $(r).text(),
    villageUrl: $(e).attr("href"),
    villageName: $(e).text(),
  };
}
function isBarb(t) {
  return -1 !== t.search("(---)");
}
function calculateSupport() {
  const t = { totalUnits: {}, pop: 0, tribes: {} },
    e = { totalUnits: {}, pop: 0, villages: {} },
    a = { totalUnits: {}, pop: 0, villages: {} };
  return (
    $("#units_table")
      .find("tbody tr")
      .each((n, r) => {
        if ($(r).hasClass("units_away")) return;
        const i = $(r).find("td").toArray(),
          {
            text: l,
            playerName: s,
            tribeName: o,
            villageUrl: p,
            villageName: d,
          } = parseVillageData($(i.shift()));
        if (!d) return;
        let u = null,
          g = null;
        s
          ? (t.tribes[o] ||
              (t.tribes[o] = { totalUnits: {}, pop: 0, players: {} }),
            (u = t.tribes[o]).players[s] ||
              (u.players[s] = { totalUnits: {}, pop: 0, villages: {} }),
            (g = u.players[s]))
          : (g = isBarb(l) ? e : a),
          g.villages[d] || (g.villages[d] = { units: {}, pop: 0, url: p }),
          (village = g.villages[d]);
        for (let e = 1; e < i.length; e++) {
          const a = game_data.units[e - 1];
          if ("militia" === a) continue;
          const n = parseInt($(i[e]).text()),
            r = n * getUnitPop(a);
          g.totalUnits[a] || (g.totalUnits[a] = 0),
            village.units[a] || (village.units[a] = 0),
            (g.totalUnits[a] += n),
            (g.pop += r),
            (village.units[a] += n),
            (village.pop += r),
            u &&
              (t.totalUnits[a] || (t.totalUnits[a] = 0),
              u.totalUnits[a] || (u.totalUnits[a] = 0),
              (t.totalUnits[a] += n),
              (u.totalUnits[a] += n),
              (u.pop += r),
              (t.pop += r));
        }
      }),
    { players: t, own: a, barbs: e }
  );
}
function generateOutput(t) {
  for (tribeName in (console.log(t), (tribeRows = ""), t.players.tribes)) {
    const e = t.players.tribes[tribeName];
    tribeName = "" === tribeName ? "Tribeless" : tribeName;
    let a = "",
      n = 0;
    for (playerName in e.players) {
      const t = e.players[playerName];
      a += drawExpandableWidget(
        `${playerName.replaceAll(/[^a-zA-Z\d_-]+/g, "")}_${++n}`,
        `${playerName} (${t.pop} population)`,
        drawPlayerDetails(t.totalUnits, t.pop, t.villages)
      );
    }
    tribeRows += drawTribeRow(tribeName, drawUnits(e.totalUnits), e.pop, a);
  }
  const e = drawTable(["Tribe", "Details", "Action"], tribeRows),
    a = drawPlayerDetails(t.own.totalUnits, t.own.pop, t.own.villages),
    n = drawPlayerDetails(t.barbs.totalUnits, t.barbs.pop, t.barbs.villages);
  return drawResultBox([
    drawExpandableWidget(
      "own_sup_table",
      `Support in your own villages (${t.own.pop} population)`,
      a
    ),
    drawExpandableWidget(
      "tribes_sup_table",
      "Support in other players villages",
      e
    ),
    drawExpandableWidget(
      "barbs_sup_table",
      `Support in barbarian villages (${t.barbs.pop} population)`,
      n
    ),
  ]);
}
function drawUnits(t) {
  let e = "";
  for (const a in t)
    t[a] && (e += `<span style="margin-right: 15px">${a}: ${t[a]}</span>`);
  return e;
}
function drawTribeRow(t, e, a, n) {
  return `<tr>\n                    <th rowspan="2" style="width: 10%; text-align: center; font-size: 120%;">${t}</th>\n                    <td>\n                        <div style="font-weight: bold;">Total Units (${a} population):</div>\n                        ${e}\n                    </td>\n                    <td>Withdraw</td>\n                </tr>\n                <tr>\n                    <td colspan="2">\n                        <div style="font-weight: bold;">Units per Player (todo - pop):</div>\n                        ${n}\n                    </td>\n                </tr>`;
}
function drawPlayerDetails(t, e, a) {
  let n = "";
  for (villageName in a)
    n += `<tr class="nowrap">\n                                    <td style="background-color: #fff5da">\n                                    <a href="${
      a[villageName].url
    }">${villageName}</a>\n                                    </td>\n                                    <td style="background-color: #fff5da">\n                                    ${drawUnits(
      a[villageName].units
    )}\n                                    </td>\n                                </tr>`;
  return `<table class="vis" width="100%">\n                            <tbody>\n                                <tr class="nowrap">\n                                    <td colspan="2" style="background-color: #fff5da">\n                                        <div style="font-weight: bold;">Total Units (${e} population):</div>\n                                            ${drawUnits(
    t
  )}\n                                    </td>\n                                </tr>\n                                ${n}\n                            </tbody>\n                        </table>`;
}
function drawTable(t, e) {
  return `<table class="vis" width="100%">\n                        <thead>\n                            <tr style=" text-align: center;">\n                                ${(t = t
    .map((t) => `<th>${t}</th>`)
    .join(
      ""
    ))}\n                            </tr>\n                        </thead>\n                    <tbody>${e}</tbody>\n        </table>`;
}
function drawResultBox(t) {
  return `<div id="result_box" style="margin-top: 15px">${(t = t.join(
    ""
  ))}</div>`;
}
function onToggleWidget(t, e) {
  "graphic/minus.png" === $(e).attr("src")
    ? ($(`#${t} > div.widget_content`).hide(),
      $(e).attr("src", "graphic/plus.png"))
    : ($(`#${t} > div.widget_content`).show(),
      $(e).attr("src", "graphic/minus.png"));
}
function drawExpandableWidget(t, e, a, n = !1) {
  return `<div id="${t}" class="vis moveable widget " style="margin: 5px;">\n    <h4 class="head with-button ui-sortable-handle" style="padding: 4px 3px 4px 15px;">\n        <img style="float:right" class="widget-button" onclick="return onToggleWidget( '${t}', this );"\n            src="${
    n ? "graphic/minus.png" : "graphic/plus.png"
  }"> ${e}\n    </h4>\n            <div class="widget_content" style="${
    n ? "display: block" : "display: none"
  }">${a}</div>\n        </div>\n    `;
}
