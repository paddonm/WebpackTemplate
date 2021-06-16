export const createGoogleMap = target => {
  function initMap() {
    var myLatLng = {
      lat: 43.6222102,
      lng: -79.6694881
    };
  
    var map = new google.maps.Map(target, {
      zoom: 15,
      center: myLatLng
    });
  
    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
    });
  }
  initMap();
}
