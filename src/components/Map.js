import GoogleMapReact from 'google-map-react'

const Map = ({ center, zoom }) => {

    return (
        <div className="map">
            <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyCQjKjYCnnfr0Y08b96337CGTFHoB5z12s' }}
                defaultCenter={ { lat: 42.3265, lng: -122.8756 } }
                defaultZoom={ 6 }
                yesIWantToUseGoogleMapApiInternals = {true}
                            >
            </GoogleMapReact>
        </div>
    )
}

Map.defaultProps = {
    center: {
        lat: 42.3265,
        lng: -122.8756
    },
    zoom: 6
}

export default Map