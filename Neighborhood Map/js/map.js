var map;
var gmarkers = [];
var myVM;

function initMap() {
    var myLatLng = {lat: 38.8822295, lng: -77.0495947};
    map = new google.maps.Map(document.getElementById('map'), {
              zoom: 12,
              center: myLatLng,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
    });

    myVM = new ViewModel();
    ko.applyBindings(myVM, document.getElementById("locations"));
};

var Locations = [
    {
        name: 'The White House',
        lat:  38.896326,
        lng: -77.035518,
        address: '1600 Pennsylvania Ave NW, Washington, DC ',
        index: 0,
        yelpID: 'the-white-house-garden-tour-washington',
        reviewCount: 0,
        imageUrl: null,
        ratingImageUrl: '',
        snippet: ''

    },
    {
        name: 'Smithsonian National Zoological Park',
        lat:  38.929451,
        lng: -77.050670,
        address: '3001 Connecticut Ave NW, Washington, DC',
        index: 1,
        yelpID: 'smithsonian-national-zoological-park-washington-2',
        reviewCount: 0,
        imageUrl: null,
        ratingImageUrl: '',
        snippet: ''

    },
    {
        name: 'Washington National Cathedral',
        lat:  38.930519,
        lng: -77.070792,
        address: '3101 Wisconsin Ave NW, Washington, DC',
        index: 2,
        yelpID: 'washington-national-cathedral-washington-5',
        reviewCount: 0,
        imageUrl: null,
        ratingImageUrl: '',
        snippet: ''

    },
    {
        name: 'Lincoln Memorial',
        lat:  38.889269,
        lng: -77.049972,
        address: '2 Lincoln Memorial Cir NW, Washington, DC',
        index: 3,
        yelpID: 'lincoln-memorial-washington-2',
        reviewCount: 0,
        imageUrl: '',
        ratingImageUrl: '',
        snippet: ''

    },
    {
        name: 'Nationals Park',
        lat:  38.873027,
        lng: -77.007744,
        address: '1500 S Capitol St SE, Washington, DC',
        index: 4,
        yelpID: 'nationals-park-washington',
        reviewCount: 0,
        imageUrl: '',
        ratingImageUrl: '',
        snippet: ''

    }
]

var Location = function(map, data){
	var marker;

	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.address = ko.observable(data.address);
	this.yelpID = ko.observable(data.yelpID);
	this.index = ko.observable(data.index);
	this.reviewCount = ko.observable(data.reviewCount);
    this.imageUrl = ko.observable(data.imageUrl);
    this.ratingImageUrl = ko.observable(data.ratingImageUrl);
    this.snippet = ko.observable(data.snippet);

	marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.lat, data.lng),
		animation: google.maps.Animation.DROP,
		icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
	});

          
	var infowindow = new google.maps.InfoWindow({
          content: "<strong>" + data.name + "</strong>" + "<br>" + data.address
        });

	google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, this);
        clicked_item = myVM.locationList()[data.index];
        locationClick(marker,clicked_item);
    
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
    	infowindow.open(map, this);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
    	infowindow.close();
    });

	this.isVisible = ko.observable(false);

	this.isVisible.subscribe(function(currentState){
		if (currentState) {
			marker.setMap(map);
		} else {
			marker.setMap(null);
		}
	});

	this.isVisible(true);
	gmarkers.push(marker);
}


var ViewModel = function(){

    var self = this;
    this.markerList = ko.observableArray([]);
    this.query = ko.observable('');
    this.currentLoc = ko.observable('');
    this.errorMsg = ko.observable('');


    this.locationList = ko.observableArray([]);
    Locations.forEach(function(locItem){
    	self.locationList.push(new Location(map, locItem));
    });

    this.selectedItem = ko.observable('');

    // location filter is used for the search field
    self.filteredLocations = ko.computed(function () {
        var filter = self.query().toLowerCase();
        var match;

        if (!filter) {
        	match = self.locationList();
        	match.forEach(function(item){
    			item.isVisible(true);
    		});
            return match
        } else {
            var isSelected;
            return ko.utils.arrayFilter(self.locationList(), function (item) {
                match = item.name().toLowerCase().indexOf(filter) !== -1;
                item.isVisible(match);
                self.selectedItem('');
                self.currentLoc('');
                toggleMarkers(null);
                return match;
            });
        }
    });

    this.hilightItem = function(item){
        self.selectedItem(item.name());
    };

    this.changeCurrentLoc = function(item){
        self.currentLoc(item);
    };

    this.onClick = function(item){
        locationClick(gmarkers[item.index()], item);
    };

}

function toggleMarkers(marker){
    for (i=0; i < gmarkers.length; i++){
            gmarkers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        }
    if (marker){
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }    
    
    };

function locationClick(marker, clicked_item){
    toggleMarkers(marker);
    myVM.hilightItem(clicked_item);
    getYelpData(clicked_item);
};
    
//Yelp functions bellow

function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    };

function getYelpData(item){
    var yelpID = item.yelpID();
    var auth = {
                    //
                    // Update with your auth tokens.
                    //
                    consumerKey : "bT_oGy6VaM-THMcJictS1w",
                    consumerSecret : "vef4zotFmvEU35yqbJrgy9jR3WY",
                    accessToken : "cJYaw6hc8akMEXOhEHkiiCVnvvhW37db",
                    accessTokenSecret : "JYNvGWMLLDloDLMyKQqja8GD2o0"
            };

    var yelp_url = 'https://api.yelp.com/v2/business/' + yelpID;

    var parameters = {

            oauth_consumer_key: auth.consumerKey,
            oauth_token: auth.accessToken,
            oauth_nonce: nonce_generate(),
            oauth_timestamp: Math.floor(Date.now()/1000),
            oauth_signature_method: 'HMAC-SHA1',
            callback: null       
        };

    var oauth_signature = oauthSignature.generate('GET', yelp_url, parameters, auth.consumerSecret, auth.accessTokenSecret);
    parameters.oauth_signature = oauth_signature; 

    $.ajax({
            'url' : yelp_url,
            'data' : parameters,
            'dataType' : 'jsonp',
            'jsonpCallback' : 'myCallback',
            'cache': true
    })
    .done(function(data, textStatus, jqXHR) {
        myVM.errorMsg('');
        
        item.reviewCount(JSON.stringify(data.review_count));
        
        // removing extra quotes from image URL
        var image_url = JSON.stringify(data.image_url);
        image_url = image_url.replace(/["]+/g, '')
        item.imageUrl(image_url);

        // removing extra quotes from image URL
        var rating_url = JSON.stringify(data.rating_img_url);
        rating_url = rating_url.replace(/["]+/g, '')
        item.ratingImageUrl(rating_url);

        item.snippet(JSON.stringify(data.snippet_text));

        myVM.changeCurrentLoc(item);

    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
        myVM.errorMsg('Could not load Yelp reviews');
        myVM.changeCurrentLoc('');
    });

};

