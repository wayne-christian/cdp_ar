// use when testing phone gap as will not get fired in browser
document.addEventListener("deviceready", function () {
    console.log('device ready');
	setupPush()
    setup();

});

// use when  in browser
$(document).ready(function () {
    console.log('ready');
    setup();

});

function setup() {
    var track_id = '';
    var watch_id = null; // ID of the geolocation
    var tracking_data = [];

	//check we are offline
    if (window.navigator.offLine) {
        $("#home_network_button").text('No Internet Access')
            .attr("data-icon", "delete")
            .button('refresh');
    } else {
        console.log('online');
    }

    $("#home_clearstorage_button").on('click', function (event) {
        console.log('clear');
        event.preventDefault();
        window.localStorage.clear();
    });

    $("#startTracking_start").on('click', function () {


        console.log('start tracking');
        // Start tracking the User
        watch_id = navigator.geolocation.watchPosition(

            // Success
            function (position) {
                var g = {
                    timestamp: position.timestamp,
                    coords: {
                        heading: null,
                        altitude: null,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        latitude: position.coords.latitude,
                        speed: position.coords.speed,
                        altitudeAccuracy: null
                    }
                };
                tracking_data.push(g);
                console.log(g, tracking_data.length);

            },

            // Error
            function (error) {
                console.log(error);
            },

            // Settings
            {
                enableHighAccuracy: true
            });

        // Tidy up the UI
        track_id = $("#track_id").val();

        $("#track_id").hide();

        $("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");
    });

    $("#startTracking_stop").on('click', function () {

        // Stop tracking the user
        navigator.geolocation.clearWatch(watch_id);
        console.log('stop tracking', tracking_data, tracking_data.length, JSON.stringify(tracking_data));
        // Save the tracking data
        //if(track_id==''){track_id='No Name'+DATE()}
        window.localStorage.setItem(track_id, JSON.stringify(tracking_data));
        // Reset watch_id and tracking_data 
        watch_id = null;
        tracking_data = null;
        console.log('removed');

        // Tidy up the UI
        $("#track_id").val("").show();

        $("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");

    });



    $("#home_seedgps_button").on('click', function () {
        console.log('add storage');
        window.localStorage.setItem('Sample block', '[{"timestamp":1335700802000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700803000,"coords":{"heading":null,"altitude":null,"longitude":170.33481666666665,"accuracy":0,"latitude":-45.87465,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700804000,"coords":{"heading":null,"altitude":null,"longitude":170.33426999999998,"accuracy":0,"latitude":-45.873708333333326,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700805000,"coords":{"heading":null,"altitude":null,"longitude":170.33318333333335,"accuracy":0,"latitude":-45.87178333333333,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700806000,"coords":{"heading":null,"altitude":null,"longitude":170.33416166666666,"accuracy":0,"latitude":-45.871478333333336,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700807000,"coords":{"heading":null,"altitude":null,"longitude":170.33526833333332,"accuracy":0,"latitude":-45.873394999999995,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700808000,"coords":{"heading":null,"altitude":null,"longitude":170.33427333333336,"accuracy":0,"latitude":-45.873711666666665,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700809000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}}]');

    });

}



// When the user views the history page
$(document).on('pagecreate', '#history', function () {
    console.log('history page');

    // Count the number of entries in localStorage and display this information to the user
    tracks_recorded = window.localStorage.length;
    $("#tracks_recorded").html("<strong>" + tracks_recorded + "</strong> workout(s) recorded");

    // Empty the list of recorded tracks
    $("#history_tracklist").empty();

    // Iterate over all of the recorded tracks, populating the list
    for (i = 0; i < tracks_recorded; i++) {
        $("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
    }

    // Tell jQueryMobile to refresh the list
    $("#history_tracklist").listview('refresh');

    // When the user clicks a link to view track info, set/change the track_id attribute on the track_info page.
    $("#history_tracklist li a").on('click', function () {
        console.log('click track');
        $("#track_info").attr("track_id", $(this).text());

    });

});




// When the user views the Track Info page
$(document).on('pagecreate', '#track_info', function () {

    // Find the track_id of the workout they are viewing
    var key = $(this).attr("track_id");
    console.log('track info', key);
    // Update the Track Info page header to the track_id
    $("#track_info div[data-role=header] h1").text(key);

    // Get all the GPS data for the specific workout
    var data = window.localStorage.getItem(key);

    // Turn the stringified GPS data back into a JS object
    data = JSON.parse(data);

    // Calculate the total distance travelled
    total_km = 0;

    for (i = 0; i < data.length; i++) {

        if (i == (data.length - 1)) {
            break;
        }

        total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i + 1].coords.latitude, data[i + 1].coords.longitude);
    }

    total_km_rounded = total_km.toFixed(2);

    // Calculate the total time taken for the track
    start_time = new Date(data[0].timestamp).getTime();
    end_time = new Date(data[data.length - 1].timestamp).getTime();

    total_time_ms = end_time - start_time;
    total_time_s = total_time_ms / 1000;

    final_time_m = Math.floor(total_time_s / 60);
    final_time_s = total_time_s - (final_time_m * 60);

    // Display total distance and time
    $("#track_info_info").html('Travelled <strong>' + total_km_rounded + '</strong> km in <strong>' + final_time_m + 'm</strong> and <strong>' + final_time_s + 's</strong>');

    // Set the initial Lat and Long of the Google Map
    var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);

    // Google Map options
    var myOptions = {
        zoom: 15,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Create the Google Map, set options
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var trackCoords = [];

    // Add each GPS entry to an array
    for (i = 0; i < data.length; i++) {
        trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
    }

    // Plot the GPS entries as a line on the Google Map
    var trackPath = new google.maps.Polyline({
        path: trackCoords,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    // Apply the line to the map
    trackPath.setMap(map);


});

// Array containing GPS position objects     // Name/ID of the exercise

function gps_distance(lat1, lon1, lat2, lon2) {
    // http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

 function setupPush() {
   var push = PushNotification.init({
       "android": {
           "senderID": "378250794931"
       },
       "ios": {
		"sound": true,
		"alert": true,
		"badge": true,
		"categories": {
			"invite": {
				"yes": {
					"callback": "app.accept", "title": "Accept", "foreground": true, "destructive": false
				},
				"no": {
					"callback": "app.reject", "title": "Reject", "foreground": true, "destructive": false
				},
				"maybe": {
					"callback": "app.maybe", "title": "Maybe", "foreground": true, "destructive": false
				}
			},
			"delete": {
				"yes": {
					"callback": "app.doDelete", "title": "Delete", "foreground": true, "destructive": true
				},
				"no": {
					"callback": "app.cancel", "title": "Cancel", "foreground": true, "destructive": false
				}
			}
		}
	},
       "windows": {}
   });

   push.on('registration', function(data) {
       console.log("registration event: " + data.registrationId);
       var oldRegId = localStorage.getItem('registrationId');
       if (oldRegId !== data.registrationId) {
           // Save new registration ID
           localStorage.setItem('registrationId', data.registrationId);
           // Post registrationId to your app server as the value has changed
       }
   });

   push.on('error', function(e) {
       console.log("push error = " + e.message);
   });
   
   push.on('notification', function(data) {
         console.log('notification event');
         navigator.notification.alert(
             data.message,         // message
             null,                 // callback
             data.title,           // title
             'Ok'                  // buttonName
         );
     });
 }