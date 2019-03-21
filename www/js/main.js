// use when testing phone gap as will not get fired in browser
document.addEventListener("deviceready", function () {
    console.log('device ready');
    setup();

});

// use when  in browser
$(document).ready(function () {
    console.log('ready');
    setup();

});

function setup() {
	document.addEventListener('pause', on_Pause, false);
	document.addEventListener("menubutton", on_Pause, false);
	document.addEventListener("backbutton", on_Pause, false);
	document.addEventListener("searchbutton", on_Pause, false);
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	//alert('dready', device.platform)
	if (window.navigator.onLine) {
		$('body').addClass('online');
      
    } else {
        ////console.log('offline');
        $('body').addClass('offline');

    }
};

function onOffline() {
    // Handle the offline event
	$('body').removeClass('online');
	$('body').addClass('offline');
}
function onOnline() {
	$('body').addClass('online');
	$('body').removeClass('offline');
    // Handle the offline event
}

function on_Pause() {
	//navigator.notification.alert('pause');
  navigator.app.exitApp(); 

}