import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const InteractiveMap = () => {
  // Mock research locations
  const researchSites = [
    {
      id: 1,
      name: 'Assin Foso Primary Site',
      position: [5.7179, -1.0989],
      description: 'Main research facility and headquarters',
      type: 'headquarters'
    },
    {
      id: 2,
      name: 'Assin North Field Site',
      position: [5.7500, -1.1200],
      description: 'Community health surveillance site',
      type: 'field-site'
    },
    {
      id: 3,
      name: 'Assin South Field Site',
      position: [5.6800, -1.0800],
      description: 'Vector control intervention site',
      type: 'field-site'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Research Locations</h1>
        <p className="text-gray-600 mt-1">Interactive map of our research sites and activities</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[5.7179, -1.0989]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {researchSites.map((site) => (
              <Marker key={site.id} position={site.position}>
                <Popup>
                  <div>
                    <h3 className="font-semibold">{site.name}</h3>
                    <p className="text-sm">{site.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {researchSites.map((site) => (
          <div key={site.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">{site.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{site.description}</p>
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
              site.type === 'headquarters' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
            }`}>
              {site.type.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InteractiveMap
