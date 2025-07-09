import { useState, useRef, useMemo } from 'react'
import GoogleMapReact from 'google-map-react'
import Supercluster from 'supercluster'
import LocationMarker from './LocationMarker'
import LocationInfoBox from './LocationInfoBox'

// You will need to create this component for cluster display
const ClusterMarker = ({ lat, lng, pointCount, onClick }) => (
    <div
        style={{
            color: 'white',
            background: '#1976d2',
            borderRadius: '50%',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            border: '2px solid #fff',
            boxShadow: '0 0 6px #1976d2'
        }}
        onClick={onClick}
        lat={lat}
        lng={lng}
    >
        {pointCount}
    </div>
);

const NATURAL_EVENT_WILDFIRE = "wildfires"; // Will hold the category ID for wildfires

// Default center and zoom for the map
const defaultProps = {
    center: {
        lat: 42.3265,
        lng: -122.8756
    },
    zoom: 6
}

// Main Map component
// Accepts eventData prop which is an array of wildfire events
// Each event should have a geometry field with coordinates and categories 
const Map = ({ eventData, center = defaultProps.center, zoom = defaultProps.zoom }) => {
    const [locationInfo, setLocationInfo] = useState(null)
    const [bounds, setBounds] = useState(null)
    const [mapZoom, setMapZoom] = useState(zoom)

    // Filter for wildfires and map to GeoJSON format
    const points = useMemo(
        () =>
            eventData
                .filter(ev => ev.categories[0].id === NATURAL_EVENT_WILDFIRE)
                .map(ev => ({
                    type: "Feature",
                    properties: { cluster: false, eventId: ev.id, event: ev },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            ev.geometry[0].coordinates[0],
                            ev.geometry[0].coordinates[1]
                        ]
                    }
                })),
        [eventData]
    )

    // Set up Supercluster
    const superclusterRef = useRef(
        new Supercluster({
            radius: 60,
            maxZoom: 20,
        })
    )

    // Load points into Supercluster API
    useMemo(() => {
        superclusterRef.current.load(points)
    }, [points])

    // Get clusters for current bounds and zoom
    const clusters = useMemo(() => {
        if (!bounds) return []
        // GoogleMapReact gives bounds as {nw, se, sw, ne}
        // Supercluster expects [westLng, southLat, eastLng, northLat]
        return superclusterRef.current.getClusters(
            [
                bounds.sw.lng,
                bounds.sw.lat,
                bounds.ne.lng,
                bounds.ne.lat
            ],
            mapZoom
        )
    }, [bounds, mapZoom, points])

    // Render the map with clusters and markers
    // Each cluster is represented by ClusterMarker, and each event by LocationMarker
    // Clicking on a cluster or marker will set the location info to display in LocationInfoBox
    // LocationInfoBox is a separate component that displays information about the selected event
    return (
        <div className="map">
            <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyCQjKjYCnnfr0Y08b96337CGTFHoB5z12s' }}
                defaultCenter={center}
                defaultZoom={zoom}
                onChange={({ center, zoom, bounds }) => {
                    setBounds(bounds)
                    setMapZoom(zoom)
                    console.log('BOUNDS:', bounds)
                    console.log('CENTER:', center)
                    console.log('ZOOM:', zoom)
                }}
            >
                {clusters.map(cluster => {
                    const [lng, lat] = cluster.geometry.coordinates
                    if (cluster.properties.cluster) {
                        return (
                            <ClusterMarker
                                key={`cluster-${cluster.id}`}
                                lat={lat}
                                lng={lng}
                                pointCount={cluster.properties.point_count}
                                onClick={() => {
                                    // Optionally: zoom in on cluster click
                                }}
                            />
                        )
                    }
                    return (
                        <LocationMarker
                            key={cluster.properties.eventId}
                            lat={lat}
                            lng={lng}
                            onClick={() =>
                                setLocationInfo({
                                    id: cluster.properties.eventId,
                                    title: cluster.properties.event.title
                                })
                            }
                        />
                    )
                })}
            </GoogleMapReact>
            {locationInfo && <LocationInfoBox info={locationInfo} />}
        </div>
    )
}

export default Map