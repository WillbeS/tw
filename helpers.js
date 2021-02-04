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


function getQueryParams(url) {
  const urlParts = url.split("?");
  let queryParams = {};
  if (urlParts.length === 2) {
    const queryStrings = urlParts[1].split("&").forEach((qs) => {
      [param, value] = qs.split("=");
      queryParams[param] = value;
    });
  }

  return queryParams;
}


// Output functions:
function toggleWidget(id, img) {
  const imgSrc = $(img).attr("src");
  if (imgSrc === "graphic/minus.png") {
    $(`#${id} div.widget_content`).hide();
    $(img).attr("src", "graphic/plus.png");
  } else {
    $(`#${id} div.widget_content`).show();
    $(img).attr("src", "graphic/minus.png");
  }
}

function outputMoveableWidget(id, heading, content) {
  let output = `<div id="${id}" class="vis moveable widget ">
    <h4 class="head with-button ui-sortable-handle" style="padding: 3px">
        <img style="float:right" class="widget-button" onclick="return toggleWidget( '${id}', this );"
            src="graphic/minus.png"> ${heading}
    </h4>
            <div class="widget_content" style="display: block;">${content}</div>
        </div>
    `;

  return output;
}



// Additional stuff
//https://forum.tribalwars.net/index.php?threads/support-filter-recall.282647/