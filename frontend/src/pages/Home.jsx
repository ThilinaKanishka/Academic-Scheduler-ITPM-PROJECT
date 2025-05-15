// Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Welcome to</span>
                    <span className="block text-yellow-300"> University</span>
                  </h1>
                  <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Shaping minds, building futures. Join our community of scholars and innovators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80"
            alt="University campus"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-800">150+</p>
              <p className="mt-2 text-sm font-medium text-gray-500">ACADEMIC PROGRAMS</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-800">12:1</p>
              <p className="mt-2 text-sm font-medium text-gray-500">STUDENT TO FACULTY RATIO</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-800">95%</p>
              <p className="mt-2 text-sm font-medium text-gray-500">GRADUATION RATE</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-800">#5</p>
              <p className="mt-2 text-sm font-medium text-gray-500">NATIONAL RANKING</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Programs */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Programs
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore our most sought-after academic disciplines
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Computer Science',
                description: 'Cutting-edge technology and innovation in our state-of-the-art labs.',
                icon: '💻'
              },
              {
                name: 'Business Administration',
                description: 'Develop leadership skills with our world-class faculty.',
                icon: '📈'
              },
              {
                name: 'Engineering',
                description: ' Join the next generation of engineering leaders.',
                icon: '⚙️'
              }
            ].map((program) => (
              <div key={program.name} className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full shadow-md hover:shadow-lg transition duration-300">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl mx-auto">
                      {program.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">{program.name}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {program.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to begin your journey?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Applications for the next academic year are now open.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;