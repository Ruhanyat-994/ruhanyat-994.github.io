import React from 'react';
import { Github, Linkedin, Youtube, Twitter, Mail } from 'lucide-react';

export const Contacts = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Ruhanyat-994',
      icon: Github,
      color: 'hover:text-purple-500',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: Linkedin,
      color: 'hover:text-blue-500',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@mian_al_ruhanyat',
      icon: Youtube,
      color: 'hover:text-red-500',
    },
    {
      name: 'Twitter',
      url: 'https://x.com/M_Ruhanyat',
      icon: Twitter,
      color: 'hover:text-cyan-500',
    },
    {
      name: 'Email',
      url: 'mailto:alruhanyat994@gmail.com',
      icon: Mail,
      color: 'hover:text-green-500',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500 shadow-lg max-w-2xl w-full transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold text-center mb-8 text-cyan-500 neon-text">Contact Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-4 bg-gray-900 rounded-lg border border-gray-700 
                  ${link.color} transition-all duration-300 hover:border-cyan-500 group`}
              >
                <Icon className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-lg font-semibold">{link.name}</span>
              </a>
            );
          })}
        </div>
        
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">Feel free to reach out through any of these platforms!</p>
        </div>
      </div>
    </div>
  );
};