import { useState, useEffect } from 'react'
import Map from './components/Map'
import Loader from './components/Loader'

function App() {

  const [eventData, setEventData] = useState([])
  const [loading, setLoading] = useState(false)

    useEffect(() => {
      const fetchEvents = async () => {
        setLoading(true)
        const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&days=90')
        
        const { events } = await res.json()

        setEventData(events)
        setLoading(false)
        }

        fetchEvents()
    }, [])
    
  return (
    <div>
      { !loading ? <Map eventData={eventData} /> : <Loader /> }    
    </div>
  );
}

export default App;