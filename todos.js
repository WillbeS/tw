//Will return array with month, day, year, time or null
TODO - later;
function parseConstructionData(data) {
  if (!data) return null;

  const dateParts = data.split(" ");

  const firstWord = dateParts[0];
  switch (firstWord) {
    case "on":
    case "today":
    case "tomorrow":

    default:
      return null;
  }

  return dateParts;
}

//for attack planner
//   for (unit of game_data.units) {
//     var unitSpeed = unitConfig.find(unit + " speed").text();
//     console.log(unitSpeed);
//   }

function fnCalculateBackTime() {
  var worldConfig = fnCreateWorldConfig();

  var hasChurch =
    worldConfig && parseInt(worldConfig.find("game church").text() || "0", 10);
  var arrivalTime = new Date(
    document
      .getElementById("arrival_time")
      .value.split(":")
      .slice(0, 3)
      .join(":")
  );
  var target = document.getElementById("snipe_coord").value;
  var servertime = win.$("#serverTime").html().match(/\d+/g);
  var serverDate = win.$("#serverDate").html().match(/\d+/g);
  serverTime = new Date(
    serverDate[1] +
      "/" +
      serverDate[0] +
      "/" +
      serverDate[2] +
      " " +
      servertime.join(":")
  );
  var output = [];
  var ii, troop_count, source, launchTime;
  var units = game_data.units;
  console.log("Calculate backtime fn");

  /* Loop through your own villages */
  win.$("#combined_table tr:gt(0)").each(function (i, e) {
    source = fnExtractCoords($(this).find("td:eq(1)").html());

    if (source != target) {
      var isVisible = false;

      /* Process Each Unit */
      for (ii = 0; ii < units.length; ii++) {
        if (win.$("#view_" + units[ii]).is(":checked")) {
          troop_count = parseInt(
            $(this)
              .find("td:eq(" + (ii + (hasChurch ? 9 : 8)) + ")")
              .text(),
            10
          );

          /* Do we have Units currently Available */
          if (troop_count > 0) {
            launchTime = fnCalculateLaunchTime(
              source,
              target,
              units[ii],
              arrivalTime
            );

            /* Cache Units that can reach the target on time */
            if (launchTime.getTime() > serverTime.getTime()) {
              isVisible = true;
              output.push([
                launchTime.getTime(),
                "Send " +
                  units[ii] +
                  "(" +
                  troop_count +
                  ") from [coord]" +
                  source +
                  "[/coord] to [coord]" +
                  target +
                  "[/coord] at " +
                  launchTime.toString().replace(/(\d*:\d*:\d*)(.*)/i, "$1"),
                e,
              ]);
            }
          }
        }
      }
    }

    win.$(e).attr("style", "display:" + (isVisible ? "table-row" : "none"));
  });

  /* Sort by Launch Time in Ascending Order */
  output = output.sort(function (a, b) {
    return a[0] - b[0];
  });
  for (var qq = 0; qq < output.length; qq++) {
    win.$("#combined_table").get(0).tBodies[0].appendChild(output[qq][2]);
  }

  /* Clear existing messages and display version */
  var srcHTML = "";
  srcHTML += "<br/>";
  srcHTML += "<span>Fluffy88's Snipe Calculator</span>";
  srcHTML += "<br/>";
  srcHTML += "<span><sub>(dalesmckay modification)</sub><hr></span>";
  srcHTML += "<br/>";

  if (output.length > 0) {
    srcHTML +=
      '<div align="center"><textarea wrap="off" readonly="yes" cols="80" rows="' +
      (output.length + 1) +
      '" style="width:95%;background-color:transparent;" onfocus="this.select();">';

    for (ii = 0; ii < output.length; ii++) {
      srcHTML += output[ii][1] + "\n";
    }

    srcHTML += "</textarea></div>";
  } else {
    srcHTML += '<span style="color:red;">Impossible to reach on time</span>';
  }

  srcHTML += "<br/><br/><br/>";

  win.$("#snipe_output").html("");
  win.$("#snipe_output").append(win.$(srcHTML));
}
