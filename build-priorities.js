const needBuild = [];
const needRecruit = [];
const serverTime = new Date(game_data.time_generated);
const needRes = [];




function getProductionData() {
  const rows = window.$("#production_table > tbody > tr");

  rows.each((i, val) => {
    if (i === 0) return;

    let points = Number($(val).children("td").eq(2).text().replace(".", ""));
    let resources = $(val).children("td").eq(3).text().split(' ').map(res => Number(res.replace('.', '')));
    let warehouse = Number($(val).children("td").eq(4).text());
    let construction = $(val).children("td").eq(7).text().trim();

    //TODO - const later
    if (points < 10157) {
      console.log(points);
      console.log(resources);
      console.log(warehouse);
      console.log("-----------");
    }
  });

  //return rows;
}

getProductionData();

try {
  if (game_data.screen == "overview_villages" && game_data.mode == "prod") {
    console.log(getProductionData());
  } else {
    UI.InfoMessage("Going to the combined overview...", 3000, "success");
    window.location = game_data.link_base_pure + "overview_villages&mode=prod";
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
