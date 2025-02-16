export interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  directory: string;
  type: 'markdown' | 'pdf';
}

export interface Directory {
  name: string;
  path: string;
  image: string;
  description: string;
}

export interface PostMetadata {
  title: string;
  date: string;
  author: string;
  tags: string[];
}