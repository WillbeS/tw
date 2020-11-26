javascript: function generateOutput(defaultCoords, defaultDate) {
  let output = `<div style="text-align:center" id="snipe_output"><br/>
    <h4 style="margin-top:5px">Attack Planner</h4>
        <div id="times_setup">
        Target village: 
        <input id="snipe_coord" value="${defaultCoords}" class="text-input inactive" size="7" onFocus="this.select()" />
        Hit time:<input id="arrival_time" size="25" class="text-input inactive" value="${defaultDate}" onFocus="this.select()" />
        <input type="button" value="Go" onClick="fnCalculateBackTime()" />
        </div>
    </div>`;

  return output;
}

function fnInjectOverviewBar() {
  /* Default to your own currently active village */
  var defaultCoords = fnExtractCoords(win.$("title").html());

  /* Default to midnight of next day */
  var defaultDate = new Date();
  defaultDate.setTime(
    ((Math.floor(defaultDate.getTime() / msPerDay) + 1) * minsPerDay +
      defaultDate.getTimezoneOffset()) *
      msPerMin
  );

  defaultDate = defaultDate
    .toString()
    .replace(/\w+\s*/i, "")
    .replace(/(\d*:\d*:\d*)(.*)/i, "$1");

  //fnInjectUnits();
  win
    .$(generateOutput(defaultCoords, defaultDate))
    .insertBefore(win.$("#combined_table"));
}

function fnExtractCoords(src) {
  var vv = src.match(/\d+\|\d+/gi);
  return vv ? vv[vv.length - 1] : null;
}

function fnCalculateDistance(to, from) {
  var target = fnExtractCoords(to).match(/(\d+)\|(\d+)/);
  var source = fnExtractCoords(from).match(/(\d+)\|(\d+)/);
  var fields = Math.sqrt(
    Math.pow(source[1] - target[1], 2) + Math.pow(source[2] - target[2], 2)
  );

  return fields;
}

function fnDebugLog(msg) {
  win.$("body").append("<span>" + msg + "</span><br/>");
}

/* sendMethod = "GET" || "POST", params = json, type = xml,json,text */
function fnAjaxRequest(url, sendMethod, params, type) {
  var error = null,
    payload = null;

  win.$.ajax({
    async: false,
    url: url,
    data: params,
    dataType: type,
    type: String(sendMethod || "GET").toUpperCase(),
    error: function (req, status, err) {
      error = "ajax: " + status;
    },
    success: function (data, status, req) {
      payload = data;
    },
  });

  if (error) {
    throw error;
  }

  return payload;
}

function fnCreateConfig(name) {
  return win
    .$(fnAjaxRequest("/interface.php", "GET", { func: name }, "xml"))
    .find("config");
}
function fnCreateUnitConfig() {
  return fnCreateConfig("get_unit_info");
}
function fnCreateWorldConfig() {
  return fnCreateConfig("get_config");
}

function fnCalculateLaunchTime(source, target, unit, landingTime) {
  var distance = fnCalculateDistance(target, source);
  var unitSpeed = unitConfig.find(unit + " speed").text();

  /* Convert minutes to milli-seconds */
  var unitTime = distance * unitSpeed * msPerMin;

  /* Truncate milli-second portion of the time */
  var launchTime = new Date();
  launchTime.setTime(
    Math.round((landingTime.getTime() - unitTime) / msPerSec) * msPerSec
  );

  return launchTime;
}

function getVillages(arrivalTime, target, serverTime) {
  var output = [];
  var source, launchTime;

  let unit = "ram"; //todo select dropdown

  /* Loop through your own villages */
  win.$("#combined_table tr:gt(0)").each(function (i, e) {
    source = fnExtractCoords($(this).find("td:eq(1)").html());

    if (source == target) return;

    launchTime = fnCalculateLaunchTime(source, target, unit, arrivalTime);

    /* Cache Units that can reach the target on time */
    if (launchTime.getTime() > serverTime.getTime()) {
      output.push([
        launchTime.getTime(),
        "Send " +
          unit +
          " from [coord]" +
          source +
          "[/coord] to [coord]" +
          target +
          "[/coord] at " +
          launchTime.toString().replace(/(\d*:\d*:\d*)(.*)/i, "$1"),
        e,
      ]);
    }
  });

  return output;
}

function getServerTime() {
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

  return serverTime;
}

function fnCalculateBackTime() {
  var arrivalTime = new Date(
    document
      .getElementById("arrival_time")
      .value.split(":")
      .slice(0, 3)
      .join(":")
  );

  var serverTime = getServerTime();
  var targets = document.getElementById("snipe_coord").value.split(" ").filter(t => t !== '');

  var output = [];

  console.log(targets);
  targets.forEach((target) => {
      console.log(target)
    currentOutput = getVillages(arrivalTime, target, serverTime);
    output = output.concat(currentOutput);
    console.log(output)
  });

  //   var output = getVillages(arrivalTime, target, serverTime);

  /* Sort by Launch Time in Ascending Order */
  output = output.sort(function (a, b) {
    return a[0] - b[0];
  });

  /* Clear existing messages and display version */
  var srcHTML = "";
  srcHTML += "<br/>";
  srcHTML += "<span>Fluffy88's Snipe Calculator</span>";
  srcHTML += "<br/>";
  srcHTML += "<span><sub>(OneMoreLight modification)</sub><hr></span>";
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

  //   win.$("#snipe_output").html("");
  //   win.$("#snipe_output").append(win.$(srcHTML));
  win.$(srcHTML).insertAfter(win.$("#times_setup"));
}

try {
  if (game_data.screen == "overview_villages" && game_data.mode == "combined") {
    var win = window;

    if (win.$("#snipe_output").length <= 0) {
      var msPerSec = 1000;
      var secsPerMin = 60;
      var minsPerHour = 60;
      var hrsPerDay = 24;
      var msPerMin = msPerSec * secsPerMin;
      var msPerHour = msPerMin * minsPerHour;
      var msPerDay = msPerHour * hrsPerDay;
      var minsPerDay = hrsPerDay * minsPerHour;

      var unitConfig = fnCreateUnitConfig();

      fnInjectOverviewBar();
    }
  } else {
    UI.InfoMessage("Going to the combined overview...", 3000, "success");
    window.location =
      game_data.link_base_pure + "overview_villages&mode=combined";
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
