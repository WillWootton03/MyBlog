import { useEffect, useState } from "react";
import Post from "../components/Post";
import Sidebar from "../components/Sidebar";
import { useLocation, useNavigate } from "react-router";

export interface PostData {
    id: string;
    date: string;
    link: string;
    title: string;
    body: string;
    tag_id: string;
}

interface AdminState {
    adminKey?: string;
}


const API_URL = import.meta.env.VITE_API_URL;
const now = Date.now();

export default function Landing() {

    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as AdminState;
    const key = state?.adminKey;

    const [page, setPage] = useState(1);
    const [posts, setPosts] = useState<PostData[]>([{
        id: 'dQw4w9WgXcQ',
        date: now.toString(),
        link: '',
        title: 'The quiet places we return to',
        body: 'Wow',
        tag_id: 'programming',
    }]);
    /*
    

    useEffect(() => {
        // Check if prev posts are recently cached
        const cached_posts = localStorage.getItem(`Posts@${page}`)
        if (cached_posts) {
            try {
                const new_posts = JSON.parse(cached_posts);
                setPosts(new_posts);
            } catch {
                console.error('Failed to retrieve cached posts');
            }
        }
        else {
            const getPosts = async (): Promise<PostData[]> => {
                const res = await fetch(`${API_URL}/posts?page=${page}`);
                if (res.ok) {
                    return await res.json() as PostData[];
                }
            return []
            }

            const load_posts = async () => {
                const new_posts = await getPosts();
                setPosts(new_posts);
                // Caches posts in quick local storage 
                localStorage.setItem(`Posts@${page}`, JSON.stringify(new_posts));
            }

            load_posts();
        }
    }, [page]);
    */

    return (
        <div className="bg-white w-full lg:w-2/3 min-h-screen p-1">
            <div className=" min-h-screen w-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between py-10 bg-purple-900/30 border border-purple-900/10">
                    <div className="flex flex-col px-20 gap-y-8 text-[#56346b]">
                        <p className="italic font-semibold text-6xl">
                            The Cooked Dev
                        </p>
                        <p className="text-md ">
                            A look into my personal thoughts, opinions, life, and projects
                        </p>
                    </div>
                    <p className="px-10 text-purple-900/80"> 
                        William Wootton
                    </p>
                </div>
                {/* Main Nav */}
                <div className="top-nav flex px-8">
                    <a href="#about-me"
                        className="nav-button text-lg py-2 px-4 text-white border-r border-white/20"
                    >
                        About Me 
                    </a>
                </div>
                {/* Main */}
                <div className="flex py-8">
                    {/* Posts */}
                    <div className="flex flex-col flex-3 px-8 border-r border-gray-700/20 h-full w-full">
                        {posts.map((post) => (
                            <Post
                                key={post.id} 
                                id={post.id}
                                date={post.date}
                                link={post.link}
                                title={post.title}
                                body={post.body}
                                tag_id={post.tag_id}
                            /> 
                        ))}
                    </div>
                    {/* Sidebar */}
                    <div className="flex-1 w-full px-4">
                        <Sidebar
                            admin_key={key}
                         />
                    </div>
                </div>
            </div>
        </div>
    )
}