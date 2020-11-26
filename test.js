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

/* sendMethod = "GET" || "POST", params = json, type = xml,json,text */
function fnAjaxRequest(url,sendMethod,params,type){
	var error=null,payload=null;

	win.$.ajax({
		"async":false,
		"url":url,
		"data":params,
		"dataType":type,
		"type":String(sendMethod||"GET").toUpperCase(),
		"error":function(req,status,err){error="ajax: " + status;},
		"success":function(data,status,req){payload=data;}
	});

	if(error){
		throw(error);
	}

	return payload;
}


try {
  if (game_data.screen == "overview_villages" && game_data.mode == "prod") {
      //todo...
  } else {
    UI.InfoMessage("Going to the combined overview...", 3000, "success");
    window.location = game_data.link_base_pure + "overview_villages&mode=prod";
  }
} catch (objError) {
  var dbgMsg = "Error: " + String(objError.message || objError);
  alert(dbgMsg);
}

void 0;
