import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Directory } from '../types';
import { Terminal, FolderOpen } from 'lucide-react';

interface DirectoryGridProps {
  directories: Directory[];
  currentPage: number;
  itemsPerPage: number;
}

export const DirectoryGrid: React.FC<DirectoryGridProps> = ({
  directories,
  currentPage,
  itemsPerPage
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {directories.map((dir) => (
        <div
          key={dir.path}
          onClick={() => navigate(`/${dir.path}`)}
          className="relative group cursor-pointer overflow-hidden rounded-lg border border-cyan-500 hover:border-purple-500 transition-all duration-300 bg-gray-800 flex items-center p-4"
        >
          <div className="w-12 h-12 mr-4 flex-shrink-0">
            <img
              src={dir.image}
              alt={dir.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <FolderOpen className="w-5 h-5 text-cyan-500 mr-2" />
              <h3 className="text-xl font-bold text-white">{dir.name}</h3>
            </div>
            <p className="text-gray-300 text-sm">{dir.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}