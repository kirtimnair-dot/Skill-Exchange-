import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Star, TrendingUp, Shield, Clock, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const popularSkills = [
    { name: 'Guitar Lessons', icon: '🎸', category: 'Music' },
    { name: 'Spanish Language', icon: '🇪🇸', category: 'Language' },
    { name: 'Web Development', icon: '💻', category: 'Tech' },
    { name: 'Yoga & Meditation', icon: '🧘', category: 'Wellness' },
    { name: 'Cooking Basics', icon: '👨‍🍳', category: 'Culinary' },
    { name: 'Photography', icon: '📷', category: 'Arts' },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section with Aqua Blue Gradient */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 text-white">
        {/* Animated aqua blue background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 
            className={`text-5xl md:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Learn. <span className="text-cyan-200">Teach.</span> Connect.
          </h1>
          
          <p 
            className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Exchange skills with amazing people in your community. No experience required.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/signup" className="group">
              <button className="relative bg-white text-cyan-600 font-bold px-8 py-4 rounded-xl text-lg inline-flex items-center gap-3 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </button>
            </Link>
            
            <Link to="/skills">
              <button className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                Browse Skills
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Popular Skills Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-cyan-800">Popular Skills</h2>
              <p className="text-cyan-600">Skills our community loves to learn</p>
            </div>
            <Link to="/skills" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-2">
              View all skills
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSkills.map((skill, index) => (
              <div 
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cyan-100 group cursor-pointer ${mounted ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{skill.icon}</div>
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-sm font-semibold rounded-full">
                    {skill.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-cyan-800 group-hover:text-cyan-600 transition-colors">{skill.name}</h3>
                <p className="text-gray-600 mb-4">Learn from expert tutors in your area</p>
                <div className="flex items-center text-gray-500 text-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  <span className="font-semibold">4.8</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Flexible scheduling</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Join thousands of learners and teachers who are already sharing knowledge
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-white text-cyan-600 font-bold px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg">
                Join Free Today
              </button>
            </Link>
            <Link to="/skills">
              <button className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 text-lg">
                Explore Skills
              </button>
            </Link>
          </div>
          <p className="text-cyan-200 mt-8">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Add custom animations to Tailwind */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}