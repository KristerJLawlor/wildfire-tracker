import { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import LocationMarker from './LocationMarker'
import LocationInfoBox from './LocationInfoBox'

const NATURAL_EVENT_WILDFIRE = "wildfires";

const defaultProps = {
    center: {
        lat: 42.3265,
        lng: -122.8756
    },
    zoom: 6
}

const Map = ({ eventData, center = defaultProps.center, zoom = defaultProps.zoom }) => {
    const [locationInfo, setLocationInfo] = useState(null)

    const [bounds, setBounds] = useState(null);

    // Normalize longitude to [-180, 180]
    const normalizeLng = lng => {
        let n = ((lng + 180) % 360 + 360) % 360 - 180;
        // Handle -180 edge case
        if (n === -180) return 180;
        return n;
    };

    // Rectify longtitude bounds to handle antimeridian crossing (+180/-180 degrees)
    const isLngInBounds = (lng, lng1, lng2) => {
        lng = normalizeLng(lng);
        lng1 = normalizeLng(lng1);
        lng2 = normalizeLng(lng2);
        if (lng1 <= lng2) {
            return lng >= lng1 && lng <= lng2;
        } else {
            // Antimeridian crossing
            return lng >= lng1 || lng <= lng2;
        }
    };

    // Rectify latitude bounds to handle map flipping
    const isLatInBounds = (lat, lat1, lat2) => {
        const minLat = Math.min(lat1, lat2);
        const maxLat = Math.max(lat1, lat2);
        return lat >= minLat && lat <= maxLat;
};

    // Filter the event data to only include wildfires
    // and create markers for each wildfire event
    // The markers will be displayed on the map
    // when the map is rendered.
    // The markers will be clickable and will display
    // the location info in a box when clicked.
    // The location info will be displayed in a box
    // at the bottom of the map.    

    const filteredEvents = bounds
        ? eventData.filter(ev => {
            if (ev.categories[0].id !== NATURAL_EVENT_WILDFIRE) return false;
            const lat = ev.geometry[0].coordinates[1];
            const lng = ev.geometry[0].coordinates[0];
            return (
                isLatInBounds(lat, bounds.nw.lat, bounds.se.lat) &&
                isLngInBounds(lng, bounds.nw.lng, bounds.se.lng)
            );
        })
        : eventData.filter(ev => ev.categories[0].id === NATURAL_EVENT_WILDFIRE);


    const markers = filteredEvents.map((ev, index) => (
        <LocationMarker
            key={ev.id || index}
            lat={ev.geometry[0].coordinates[1]}
            lng={ev.geometry[0].coordinates[0]}
            onClick={() => setLocationInfo({ id: ev.id, title: ev.title })}
        />
    ));

    return (
        <div className="map">
            <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyCQjKjYCnnfr0Y08b96337CGTFHoB5z12s' }}
                defaultCenter={ center }
                defaultZoom={ zoom }
                onChange={({ center, zoom, bounds }) => {
                    setBounds(bounds);
                    console.log('BOUNDS: ' + bounds.nw.lat + ', ' + bounds.nw.lng + ' - ' + bounds.se.lat + ', ' + bounds.se.lng);
                    console.log('CENTER: ' + center.lat + ', ' + center.lng)
                    console.log('ZOOM: ' + zoom)
                }}
                    
            >
                {markers}
            </GoogleMapReact>
            {locationInfo && <LocationInfoBox info={locationInfo} />}
        </div>
    )
}



export default Map