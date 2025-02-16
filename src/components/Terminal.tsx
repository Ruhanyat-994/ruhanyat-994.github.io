import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Terminal as TerminalIcon, Search, HelpCircle } from 'lucide-react';
import { directories } from '../data/directories';
import frontMatter from 'front-matter';

interface TerminalProps {
  onCommand: (command: string) => void;
}

const AVAILABLE_COMMANDS = {
  ls: 'List all directories',
  cd: 'Navigate to a directory (cd [directory] or cd .. to go back)',
  whoami: 'Show contact information',
  find: 'Search directories and posts (find [search term])',
  clear: 'Clear terminal history',
  help: 'Show available commands'
};

export const Terminal: React.FC<TerminalProps> = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.slice(1) || 'home';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Show initial help message
  useEffect(() => {
    setHistory(['Type "help" to see available commands']);
  }, []);

  const searchPosts = async (searchTerm: string) => {
    const results: string[] = [];
    
    for (const dir of directories) {
      try {
        const posts = await import.meta.glob('../posts/**/*.{md,pdf}', { as: 'raw' });
        
        for (const [path, loader] of Object.entries(posts)) {
          const content = await loader();
          
          if (path.endsWith('.pdf')) {
            // For PDF files, just search in the filename
            if (path.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push(`${dir.path}/${path.split('/').pop()}`);
            }
          } else {
            // For markdown files, parse frontmatter and search content
            const { attributes: frontmatter, body: postContent } = frontMatter(content);
            
            if (
              frontmatter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              frontmatter.tags?.some((tag: string) => 
                tag.toLowerCase().includes(searchTerm.toLowerCase())
              ) ||
              postContent.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              results.push(`${dir.path}/${path.split('/').pop()}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching in ${dir.path}:`, error);
      }
    }
    
    return results;
  };

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const command = input.trim().toLowerCase();
      let output = '';

      if (command === 'ls') {
        output = directories
          .map(d => d.path)
          .join('\n');
        setHistory([...history, `${command}\n${output}`]);
      } else if (command === 'help') {
        output = Object.entries(AVAILABLE_COMMANDS)
          .map(([cmd, desc]) => `${cmd.padEnd(10)} - ${desc}`)
          .join('\n');
        setHistory([...history, `${command}\n${output}`]);
      } else if (command.startsWith('find ')) {
        const searchTerm = command.split(' ').slice(1).join(' ');
        const results = await searchPosts(searchTerm);
        output = results.length > 0 
          ? `Found ${results.length} results:\n${results.join('\n')}`
          : 'No results found.';
        setHistory([...history, `${command}\n${output}`]);
        setSearchResults(results);
      } else {
        setHistory([...history, command]);
      }

      setHistoryIndex(-1);
      setInput('');
      onCommand(command);

      if (command.startsWith('cd ')) {
        const path = command.split(' ')[1];
        if (path === '..') {
          navigate('/');
        } else if (directories.some(d => d.path === path)) {
          navigate(`/${path}`);
        }
      } else if (command === 'whoami') {
        navigate('/contacts');
      } else if (command === 'clear') {
        setHistory([]);
        setSearchResults([]);
      }
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-cyan-500">
      <div className="flex items-center mb-4">
        <TerminalIcon className="w-5 h-5 text-cyan-500 mr-2" />
        <span className="text-cyan-500 font-mono">rsec@{currentPath}:~$</span>
      </div>
      <div className="font-mono text-green-400 mb-4 whitespace-pre-line">
        {history.map((cmd, i) => (
          <div key={i} className="mb-1">
            <span className="text-cyan-500">rsec@{currentPath}:~$</span> {cmd}
          </div>
        ))}
        {searchResults.length > 0 && (
          <div className="mt-4 border-t border-cyan-500 pt-4">
            <div className="flex items-center text-cyan-400 mb-2">
              <Search className="w-4 h-4 mr-2" />
              <span>Search Results:</span>
            </div>
            {searchResults.map((result, i) => (
              <div 
                key={i}
                className="pl-6 text-green-400 cursor-pointer hover:text-cyan-400"
                onClick={() => navigate(`/${result}`)}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <span className="text-cyan-500 font-mono mr-2">rsec@{currentPath}:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-transparent border-none outline-none text-green-400 font-mono flex-1"
          autoFocus
        />
      </div>
    </div>
  );
};