try {
  if (game_data.screen == "overview_villages" && game_data.mode == "prod") {
    console.log("Script logic goes here");
  } else {
    UI.InfoMessage("Going to the combined overview...", 3000, "success");
    window.location = game_data.link_base_pure + "overview_villages&mode=prod";
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
