export interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  userId: string;
  venue?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  views: number;
  likes: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  hotTakeId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  hotTakesCount: number;
}

