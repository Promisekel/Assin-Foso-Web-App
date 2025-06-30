import React, { useState, useEffect } from 'react'
import { Video, Mic, MicOff, VideoOff, Phone, Users, Share, Settings, FileText, ExternalLink, Download, Calendar, Eye } from 'lucide-react'

const MeetingRoom = () => {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [showResearch, setShowResearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock participants
  const mockParticipants = [
    { id: 1, name: 'Dr. Sarah Johnson', isVideoOn: true, isAudioOn: true },
    { id: 2, name: 'Prof. Michael Asante', isVideoOn: false, isAudioOn: true },
    { id: 3, name: 'Dr. Kwame Osei', isVideoOn: true, isAudioOn: false }
  ]

  // Mock research publications
  const researchPublications = [
    {
      id: 1,
      type: 'article',
      title: 'Malaria Prevention Strategies in Rural Ghana: A Comprehensive Study',
      authors: ['Dr. Sarah Johnson', 'Prof. Michael Asante', 'Dr. Kwame Osei'],
      journal: 'Journal of Tropical Medicine',
      publishedDate: '2024-12-15',
      abstract: 'This study examines the effectiveness of various malaria prevention strategies implemented in rural communities across Ghana, focusing on the Assin Foso region.',
      doi: '10.1234/jtm.2024.001',
      pdfUrl: '#',
      views: 1250,
      downloads: 340,
      category: 'Malaria Research',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      type: 'poster',
      title: 'Vector Control Methods: Community-Based Interventions',
      authors: ['Dr. Kwame Osei', 'Dr. Sarah Johnson'],
      conference: 'International Conference on Infectious Diseases 2024',
      presentedDate: '2024-11-20',
      abstract: 'A visual presentation of community-based vector control methods and their impact on disease transmission rates in the Central Region of Ghana.',
      posterUrl: '#',
      views: 890,
      downloads: 156,
      category: 'Vector Control',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      type: 'article',
      title: 'Epidemiological Trends of Infectious Diseases in Central Ghana',
      authors: ['Prof. Michael Asante', 'Dr. Sarah Johnson'],
      journal: 'African Health Sciences',
      publishedDate: '2024-10-08',
      abstract: 'An analysis of epidemiological trends and patterns of infectious diseases in the Central Region of Ghana over the past decade.',
      doi: '10.1234/ahs.2024.045',
      pdfUrl: '#',
      views: 2100,
      downloads: 680,
      category: 'Epidemiology',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      type: 'poster',
      title: 'Digital Health Interventions in Resource-Limited Settings',
      authors: ['Dr. Sarah Johnson'],
      conference: 'Global Health Summit 2024',
      presentedDate: '2024-09-15',
      abstract: 'Exploring the potential of digital health technologies in improving healthcare delivery in resource-constrained environments.',
      posterUrl: '#',
      views: 650,
      downloads: 98,
      category: 'Digital Health',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop'
    }
  ]

  const categories = ['all', 'Malaria Research', 'Vector Control', 'Epidemiology', 'Digital Health']

  const filteredPublications = selectedCategory === 'all' 
    ? researchPublications 
    : researchPublications.filter(pub => pub.category === selectedCategory)

  useEffect(() => {
    setParticipants(mockParticipants)
  }, [])

  const toggleVideo = () => setIsVideoOn(!isVideoOn)
  const toggleAudio = () => setIsAudioOn(!isAudioOn)
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing)

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <h1 className="text-white text-lg font-semibold">Team Meeting</h1>
        <div className="flex items-center space-x-4">
          <span className="text-green-400 text-sm">● Recording</span>
          <span className="text-gray-300 text-sm">{participants.length + 1} participants</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Main participant */}
            <div className="col-span-2 bg-gray-800 rounded-lg relative overflow-hidden">
              {isVideoOn ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-lg">Your Video</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">YU</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white text-sm">You</div>
            </div>

            {/* Other participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="bg-gray-800 rounded-lg relative overflow-hidden">
                {participant.isVideoOn ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white">{participant.name}</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-white text-xs">
                  {participant.name}
                </div>
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  {!participant.isAudioOn && (
                    <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="p-4">
            {/* Tab Navigation */}
            <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setShowResearch(false)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  !showResearch 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Participants
              </button>
              <button
                onClick={() => setShowResearch(true)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  showResearch 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Research
              </button>
            </div>

            {!showResearch ? (
              // Participants Panel
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Participants</h3>
                  <span className="text-gray-400 text-sm">{participants.length + 1}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-white text-sm">You</span>
                    <div className="flex space-x-1">
                      {!isAudioOn && <MicOff className="h-4 w-4 text-red-400" />}
                      {!isVideoOn && <VideoOff className="h-4 w-4 text-red-400" />}
                    </div>
                  </div>
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <span className="text-white text-sm">{participant.name}</span>
                      <div className="flex space-x-1">
                        {!participant.isAudioOn && <MicOff className="h-4 w-4 text-red-400" />}
                        {!participant.isVideoOn && <VideoOff className="h-4 w-4 text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Research Publications Panel
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Research Publications</h3>
                  <span className="text-gray-400 text-sm">{filteredPublications.length} items</span>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Publications List */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {filteredPublications.map((publication) => (
                    <div key={publication.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                      {/* Publication Image */}
                      <div className="relative mb-3">
                        <img
                          src={publication.image}
                          alt={publication.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            publication.type === 'article' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-purple-600 text-white'
                          }`}>
                            {publication.type === 'article' ? 'Article' : 'Poster'}
                          </span>
                        </div>
                      </div>

                      {/* Publication Details */}
                      <div className="space-y-2">
                        <h4 className="text-white text-sm font-medium line-clamp-2 leading-tight">
                          {publication.title}
                        </h4>
                        
                        <p className="text-gray-300 text-xs">
                          {publication.authors.join(', ')}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(publication.publishedDate || publication.presentedDate).toLocaleDateString()}
                          </span>
                          <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                            {publication.category}
                          </span>
                        </div>

                        <p className="text-gray-300 text-xs line-clamp-2">
                          {publication.abstract}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-600">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {publication.views}
                            </span>
                            <span className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {publication.downloads}
                            </span>
                          </div>
                          <button className="text-primary-400 hover:text-primary-300 transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-xs py-2 px-3 rounded-lg transition-colors">
                            View
                          </button>
                          <button className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs py-2 px-3 rounded-lg transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-6">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {isAudioOn ? (
            <Mic className="h-6 w-6 text-white" />
          ) : (
            <MicOff className="h-6 w-6 text-white" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {isVideoOn ? (
            <Video className="h-6 w-6 text-white" />
          ) : (
            <VideoOff className="h-6 w-6 text-white" />
          )}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${isScreenSharing ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'}`}
        >
          <Share className="h-6 w-6 text-white" />
        </button>

        <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500">
          <Settings className="h-6 w-6 text-white" />
        </button>

        <button className="p-3 rounded-full bg-red-600 hover:bg-red-500">
          <Phone className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  )
}

export default MeetingRoom
