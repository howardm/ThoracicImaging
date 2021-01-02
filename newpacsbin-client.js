// initialize the pacsbin client
var pbClient = new PacsbinClient();

// prevent the page from scrolling when using the scroll wheel on the embedded study
pbClient.noPageScrollWheel();
pbClient.initLinks();
