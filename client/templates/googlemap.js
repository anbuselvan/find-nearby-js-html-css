var map;
var service;
var infoWindow;
var currentLocation;
var currentSearchTerm;
var markers = [];

var obtainingPosition = false;
var location = new ReactiveVar(null);
var error = new ReactiveVar(null);

var options = {
  enableHighAccuracy: true,
  maximumAge: 0
};

var onError = function (newError) {
  error.set(newError);
  var defLoc = new google.maps.LatLng(37.760972, -122.455768);
  location.set(defLoc);
};

var onPosition = function (newLocation) {
  location.set(newLocation);
  error.set(null);
};

var startObtainingPosition = function () {
  if (!obtainingPosition && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onPosition, onError, options);
    obtainingPosition = true;
  }
};

Template.googleMap.rendered = function() {

  startObtainingPosition();

  this.autorun(function() {
    if (!location.get()) return;

    var loc = location.get();
    currentLocation = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
    loadMap();
    infoWindow = new google.maps.InfoWindow();
  });
};

Template.googleMap.helpers({
});

Template.googleMap.events({
  'click #btn-search': function(e) {
    var searchTerm = $('#input-search').val();
    if (searchTerm && searchTerm.trim() !== '') {
      currentSearchTerm = searchTerm.trim();
      searchMap();
    }
  }
});

function loadMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: currentLocation,
      zoom: 10
  });

  var input = $("#input-city")[0];
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    currentLocation = place.geometry.location;
    loadMap();
    searchMap();
  });
}

function searchMap() {
  if (currentSearchTerm && currentSearchTerm !== '') {
    markers = [];
    var request = {
      location: currentLocation,
      radius: '500',
      query: currentSearchTerm
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: placeLoc
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent('<div><strong>' + place.name + '</strong></div>' +
                          '<div>' + place.street + '</div>');
    infoWindow.open(map, this);
  });

  markers.push(marker);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {

    // Clear previous search results
    Meteor.call('clearSearchResults');

    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      var address = place.formatted_address.split(',');
      var street = address[0];
      var city = address[1];
      var data = {
        userId: Meteor.userId(),
        pid: place.id,
        name: place.name,
        address: street,
        city: city,
        img: place.icon
      };
      place.street = street;
      createMarker(place);
      SearchResults.insert(data);
    }
  }
}
