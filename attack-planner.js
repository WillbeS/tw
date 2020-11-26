



////////////////////////////////////////////////////////
// Notes Version
///////////////////////////////////////////////////////
javascript: 
const startStr = `
[table][**]Unit Speed[||]Amount[||][color=blue]Origin[/color][||][color=blue]Destination[/color][||][color=darkgreen]Launch Time[/color][/**]
`;
const endStr = "[/table]";
const tabId = $('.memo-tab-selected').attr('id').replace('tab_', '');
const editBox = $("#message_" + tabId);
let input = editBox.text();
const rows = input.split("\n").filter((row) => {
  return row.search("ram") !== -1 || row.search("snob") !== -1;
});

const output = startStr + rows.join("\n") + endStr;

$(editBox).text(output);

void 0;



// window
//   .$('<div id="note_input">This is my TEST!!!!!!!!!!</div>')
//   .insertAfter(window.$("#quickbar_inner"));
//   console.log('done')