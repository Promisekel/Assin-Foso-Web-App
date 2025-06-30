import React, { useState } from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Award,
  BookOpen,
  Calendar,
  Users,
  Search,
  Filter,
  X,
  Eye
} from 'lucide-react'

const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const teamMembers = [
    {
      id: 1,
      name: 'Prof. Michael Asante',
      role: 'Principal Investigator',
      department: 'Epidemiology',
      email: 'masante@assinfoso-kccr.org',
      phone: '+233 (0) 244 123 456',
      location: 'Assin Foso, Ghana',
      image: '/team/prof-asante.jpg',
      bio: 'Prof. Michael Asante is a leading epidemiologist with over 20 years of experience in infectious disease research. He has published over 100 peer-reviewed papers and leads multiple international collaborations in malaria control and elimination strategies.',
      specialization: ['Malaria Epidemiology', 'Disease Surveillance', 'Public Health Policy'],
      education: [
        'PhD in Epidemiology - Harvard T.H. Chan School of Public Health',
        'MPH in Global Health - Johns Hopkins Bloomberg School of Public Health', 
        'MBBS - University of Ghana Medical School'
      ],
      achievements: [
        'WHO Excellence in Research Award 2023',
        'Ghana National Science Award 2022',
        'Fellow, Royal Society of Tropical Medicine'
      ],
      publications: 127,
      yearsExperience: 22,
      social: {
        linkedin: 'https://linkedin.com/in/michael-asante',
        twitter: 'https://twitter.com/prof_asante'
      }
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      role: 'Senior Research Scientist',
      department: 'Field Operations',
      email: 'sjohnson@assinfoso-kccr.org',
      phone: '+233 (0) 244 789 012',
      location: 'Assin Foso, Ghana',
      image: '/team/dr-johnson.jpg',
      bio: 'Dr. Sarah Johnson specializes in field-based epidemiological studies and community health interventions. She has extensive experience in malaria vector control, community engagement, and implementation research.',
      specialization: ['Vector Control', 'Community Health', 'Field Research'],
      education: [
        'PhD in Entomology - London School of Hygiene & Tropical Medicine',
        'MSc in Medical Entomology - University of Cape Town',
        'BSc in Biology - University of Ghana'
      ],
      achievements: [
        'Young Investigator Award - American Society of Tropical Medicine',
        'Excellence in Field Research - Ghana Health Service'
      ],
      publications: 45,
      yearsExperience: 8,
      social: {
        linkedin: 'https://linkedin.com/in/sarah-johnson-phd',
        twitter: 'https://twitter.com/dr_sarahjohnson'
      }
    },
    {
      id: 3,
      name: 'Dr. Kwame Osei',
      role: 'Data Scientist',
      department: 'Analytics',
      email: 'kosei@assinfoso-kccr.org',
      phone: '+233 (0) 244 345 678',
      location: 'Accra, Ghana',
      image: '/team/dr-osei.jpg',
      bio: 'Dr. Kwame Osei leads our data analytics and biostatistics team. He develops advanced statistical models for disease prediction, outbreak detection, and epidemiological surveillance systems.',
      specialization: ['Biostatistics', 'Machine Learning', 'Data Visualization'],
      education: [
        'PhD in Biostatistics - University of Washington',
        'MSc in Statistics - University of Ghana',
        'BSc in Mathematics - Kwame Nkrumah University of Science and Technology'
      ],
      achievements: [
        'Best Data Science Project - Ghana Tech Summit 2024',
        'Rising Star in Statistics - International Biometric Society'
      ],
      publications: 32,
      yearsExperience: 6,
      social: {
        linkedin: 'https://linkedin.com/in/kwame-osei-stats'
      }
    },
    {
      id: 4,
      name: 'Dr. Ama Mensah',
      role: 'Laboratory Director',
      department: 'Laboratory',
      email: 'amensah@assinfoso-kccr.org',
      phone: '+233 (0) 244 567 890',
      location: 'Assin Foso, Ghana',
      image: '/team/dr-mensah.jpg',
      bio: 'Dr. Ama Mensah oversees all laboratory operations and molecular diagnostics. She has expertise in pathogen genomics, diagnostic development, and quality assurance systems.',
      specialization: ['Molecular Diagnostics', 'Pathogen Genomics', 'Laboratory Management'],
      education: [
        'PhD in Microbiology - University of Edinburgh',
        'MSc in Clinical Microbiology - University of Ghana',
        'BSc in Biochemistry - University of Cape Coast'
      ],
      achievements: [
        'Innovation in Diagnostics Award - African Society for Laboratory Medicine',
        'Women in Science Leadership Award 2023'
      ],
      publications: 38,
      yearsExperience: 10,
      social: {
        linkedin: 'https://linkedin.com/in/ama-mensah-lab'
      }
    }
  ]

  const departments = ['all', 'Epidemiology', 'Field Operations', 'Laboratory', 'Analytics']

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter
    
    return matchesSearch && matchesDepartment
  })

  const handleMemberClick = (member) => {
    setSelectedMember(member)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMember(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Our Research Team</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Meet the dedicated scientists and researchers working to advance infectious disease 
          epidemiology and improve public health outcomes in Ghana and beyond.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
          <div className="text-sm text-gray-600">Team Members</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
          <BookOpen className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {teamMembers.reduce((sum, member) => sum + member.publications, 0)}
          </div>
          <div className="text-sm text-gray-600">Publications</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
          <Award className="h-8 w-8 text-success-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {teamMembers.reduce((sum, member) => sum + member.achievements.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Awards</div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
          <Calendar className="h-8 w-8 text-warning-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(teamMembers.reduce((sum, member) => sum + member.yearsExperience, 0) / teamMembers.length)}
          </div>
          <div className="text-sm text-gray-600">Avg. Experience</div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => handleMemberClick(member)}
          >
            <div className="p-6">
              {/* Profile Image */}
              <div className="relative mb-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    member.department === 'Epidemiology' ? 'bg-primary-100 text-primary-700' :
                    member.department === 'Field Operations' ? 'bg-secondary-100 text-secondary-700' :
                    member.department === 'Laboratory' ? 'bg-success-100 text-success-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
                    {member.department}
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {member.location}
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {member.specialization.slice(0, 2).map((spec, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                  {member.specialization.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      +{member.specialization.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center text-sm mb-4">
                <div>
                  <div className="font-semibold text-gray-900">{member.publications}</div>
                  <div className="text-gray-500">Publications</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{member.yearsExperience}y</div>
                  <div className="text-gray-500">Experience</div>
                </div>
              </div>

              {/* Contact & View Details */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <button className="flex items-center text-xs text-primary-600 hover:text-primary-700">
                  <Eye className="h-3 w-3 mr-1" />
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={closeModal}></div>

            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Section */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <div className="h-32 w-32 mx-auto rounded-full bg-primary-600 flex items-center justify-center mb-4">
                        <span className="text-white text-4xl font-bold">
                          {selectedMember.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900">{selectedMember.name}</h4>
                      <p className="text-gray-600 mb-2">{selectedMember.role}</p>
                      <p className="text-sm text-gray-500 mb-4">{selectedMember.department}</p>
                      
                      {/* Contact Info */}
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedMember.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedMember.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedMember.location}</span>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-3 mt-4">
                        {selectedMember.social.linkedin && (
                          <a
                            href={selectedMember.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary-600"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {selectedMember.social.twitter && (
                          <a
                            href={selectedMember.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary-600"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Biography</h5>
                      <p className="text-gray-600">{selectedMember.bio}</p>
                    </div>

                    {/* Specializations */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Areas of Expertise</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.specialization.map((spec, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Education</h5>
                      <ul className="space-y-1">
                        {selectedMember.education.map((edu, index) => (
                          <li key={index} className="text-gray-600 text-sm">• {edu}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Achievements & Awards</h5>
                      <ul className="space-y-1">
                        {selectedMember.achievements.map((achievement, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start">
                            <Award className="h-4 w-4 mr-2 text-warning-500 mt-0.5 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Team
