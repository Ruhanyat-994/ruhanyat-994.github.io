import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import frontMatter from 'front-matter';

// Set PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PostContentProps {
  content: string;
  type?: 'markdown' | 'pdf';
}

interface PostMetadata {
  title: string;
  date: string;
  author: string;
  tags: string[];
}

export const PostContent: React.FC<PostContentProps> = ({ content, type = 'markdown' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  
  if (type === 'pdf') {
    return (
      <div className="flex flex-col items-center">
        <Document
          file={content}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="max-w-full"
        >
          <Page 
            pageNumber={pageNumber} 
            className="border border-cyan-500 rounded-lg shadow-lg"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="p-2 bg-cyan-600 rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-white">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 bg-cyan-600 rounded-full disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Parse frontmatter
  const { attributes: metadata, body: markdownContent } = frontMatter<PostMetadata>(content);
  const { title, date, author, tags } = metadata;

  return (
    <div className="prose prose-invert max-w-none">
      {/* Metadata section */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-cyan-500">
        <h1 className="text-3xl font-bold text-cyan-500 mb-2">{title}</h1>
        <div className="text-gray-400">
          <p>By {author} • {new Date(date).toLocaleDateString()}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-gray-700 rounded-full text-sm text-cyan-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Markdown content */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-cyan-500 mt-8 mb-4 border-b border-cyan-500 pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-cyan-400 mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-cyan-300 mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-cyan-200 mt-3 mb-2">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-cyan-500 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-800 border-b border-cyan-500">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-cyan-400 font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-t border-gray-700 text-gray-300">{children}</td>
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="mb-4">
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg border border-cyan-500 !bg-gray-900"
                  showLineNumbers
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 pl-4 my-4 italic text-gray-400 bg-gray-800 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="rounded-lg border border-cyan-500 shadow-lg max-w-full my-4"
              loading="lazy"
            />
          ),
          a: ({ href, children }) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-8 border-t border-cyan-500" />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}