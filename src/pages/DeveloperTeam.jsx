import React from 'react';
import { Link } from 'react-router-dom';

const DeveloperTeam = () => {
  const developers = [
    {
      name: 'Developer 1',
      role: 'Full Stack Developer',
      image: 'https://via.placeholder.com/150',
      description: 'Experienced in web development and system architecture.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Developer 2',
      role: 'Frontend Developer',
      image: 'https://via.placeholder.com/150',
      description: 'Specialized in creating beautiful and responsive user interfaces.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Developer 3',
      role: 'Backend Developer',
      image: 'https://via.placeholder.com/150',
      description: 'Expert in database design and API development.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/" className="text-gray-800 hover:text-gray-600">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Meet Our Development Team
          </h1>
          <p className="mt-4 text-xl text-center text-gray-600">
            The talented individuals behind EASYtizen
          </p>
        </div>
      </header>

      {/* Team Grid */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {developers.map((dev, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200">
              <img
                src={dev.image}
                alt={dev.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{dev.name}</h3>
                <p className="text-indigo-600 mt-1">{dev.role}</p>
                <p className="text-gray-600 mt-3">{dev.description}</p>
                <div className="mt-4 flex space-x-4">
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    GitHub
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DeveloperTeam; 