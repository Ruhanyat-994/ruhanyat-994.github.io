import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Terminal } from './components/Terminal';
import { DirectoryGrid } from './components/DirectoryGrid';
import { Contacts } from './components/Contacts';
import { PostContent } from './components/PostContent';
import { directories } from './data/directories';

function App() {
  const [titleText, setTitleText] = useState('>_');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Changed from 6 to 9

  useEffect(() => {
    const sequence = [
      { text: '>_R', delay: 500 },
      { text: '>_Rs', delay: 300 },
      { text: '>_Rse', delay: 300 },
      { text: '>_Rsec', delay: 500 },
      { text: 'M', delay: 600 },
      { text: 'Mi', delay: 100 },
      { text: 'Mian', delay: 100 },
      { text: 'Mian Al', delay: 100 },
      { text: 'Mian Al R', delay: 100 },
      { text: 'Mian Al Ru', delay: 100 },
      { text: 'Mian Al Ruhany', delay: 100 },
      { text: 'Mian Al Ruhanyat', delay: 100 }
    ];

    let timeout: NodeJS.Timeout;
    let currentIndex = 0;

    const animateTitle = () => {
      if (currentIndex < sequence.length) {
        const current = sequence[currentIndex];
        setTitleText(current.text);
        currentIndex++;
        timeout = setTimeout(animateTitle, current.delay);
      }
    };

    animateTitle();
    return () => clearTimeout(timeout);
  }, []);

  const handleCommand = (command: string) => {
    console.log('Command:', command);
  };

  const totalPages = Math.ceil(directories.length / itemsPerPage);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Link to="/">
          <h1 className="text-4xl font-bold text-center mb-8 font-mono text-cyan-500 hover:text-purple-500 transition-colors duration-300 cursor-pointer">
            {titleText}
            <span className="animate-pulse">_</span>
          </h1>
        </Link>
        
        <Terminal onCommand={handleCommand} />
        
        <Routes>
          <Route path="/" element={
            <>
              <DirectoryGrid 
                directories={directories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
              {directories.length > itemsPerPage && (
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          } />
          <Route path="/contacts" element={<Contacts />} />
          {directories.map(dir => (
            <Route key={dir.path} path={`/${dir.path}/*`} element={<DirectoryContent path={dir.path} />} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

const DirectoryContent: React.FC<{ path: string }> = ({ path }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const { "*": splat } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const modules = import.meta.glob('/src/posts/**/*.{md,pdf}', { as: 'raw' });
        const postPromises = Object.entries(modules)
          .filter(([filePath]) => filePath.includes(`/posts/${path}/`))
          .map(async ([filePath, loader]) => {
            const content = await loader();
            return { path: filePath, content };
          });

        const loadedPosts = await Promise.all(postPromises);
        
        if (loadedPosts.length > 0) {
          // If no specific post is selected, show the first one
          if (!splat) {
            setSelectedPost(loadedPosts[0].content);
          } else {
            // Find the specific post
            const selectedPostData = loadedPosts.find(post => 
              post.path.endsWith(`/${splat}`)
            );
            if (selectedPostData) {
              setSelectedPost(selectedPostData.content);
            }
          }
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, [path, splat]);

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-cyan-500 mb-4">
        {directories.find(d => d.path === path)?.name}
      </h2>
      {selectedPost && (
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500">
          <PostContent content={selectedPost} />
        </div>
      )}
    </div>
  );
};

export default App;