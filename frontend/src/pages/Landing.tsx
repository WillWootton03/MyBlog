import { useEffect, useState } from "react";
import Post from "../components/Post";
import Sidebar from "../components/Sidebar";
import NewPostModal from "../components/NewPostModal";
import { useMain } from "../contexts/MainContext";

export default function Landing() {

    const { posts, page, setPage, key, createPost, getPosts, PAGE_SIZE } = useMain();
    const [displayNewPostModal, setDisplayNewPostModal] = useState(false);
    const [postsLength, setPostsLength] = useState(0);

    useEffect(() => {
        const all_posts = sessionStorage.getItem('posts'); 
        setPostsLength(all_posts ? JSON.parse(all_posts).length : 0);
    }, [posts])

    async function handlePostSubmit(title: string, body: string, link: string, tag_id: string) {
        setDisplayNewPostModal(false);
        createPost(title, link, body, tag_id);
        getPosts();
    }

    async function handleNewPage(change: number) {
        if (change < 1) {
            setPage(page + change < 1 ? 1 : page + change)
        } else {
            setPage((page + change - 1) * PAGE_SIZE > posts.length ? page : page + change)
        }
    }

    // TODO: Fix loading posts logic
    useEffect(() => {
        getPosts();
    }, [page])

        return (
        <>
            <div className={`bg-white/80 w-full lg:w-2/3 min-h-screen p-1 flex ${
                displayNewPostModal ? 'backdrop-blur-xl' : 'backdrop-blur-none'
            }`}>

                <div className="w-full flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between py-10 bg-purple-900/30 border border-purple-900/10">
                        <div className="flex flex-col px-20 gap-y-8 text-[#56346b]">
                            <p className="italic font-semibold text-6xl">
                                The Cooked Dev
                            </p>

                            <p className="text-md">
                                A look into my personal thoughts, opinions, life, and projects
                            </p>
                        </div>

                        <p className="px-10 text-purple-900/80">
                            William Wootton
                        </p>
                    </div>

                    {/* Main Nav */}
                    <div className="top-nav flex px-8 justify-between">
                        <div className="h-fit">
                            <a
                                href="#about-me"
                                className="nav-button inline-block text-lg px-4 text-white border-r border-white/20 py-2"
                            >
                                About Me
                            </a>
                        </div>

                        <button
                            onClick={() => setDisplayNewPostModal((prev) => !prev)}
                            className={`text-lg px-4 text-white border-l border-white/20 py-2 cursor-pointer nav-button ${
                                key ? 'flex' : 'hidden'
                            }`}
                        >
                            New Post
                        </button>
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
                            <Sidebar />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between px-20 py-1">
                        <a
                            onClick={() => handleNewPage(-1)}
                            className={`text-purple-600/70 underline cursor-pointer ${
                                page == 1 ? 'invisible' : 'flex'
                            }`}
                        >
                            previous page
                        </a>

                        <a
                            onClick={() => handleNewPage(1)}
                            className={`text-purple-600/70 underline cursor-pointer ${
                                (page * PAGE_SIZE) >= postsLength ? 'invisible' : 'flex'
                            }`}
                        >
                            next page
                        </a>
                    </div>
                </div>
            </div>

            {displayNewPostModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center">
                    <div className="absolute inset-0 backdrop-blur-xs bg-black/10" />

                    <div className="relative z-10 bg-white w-1/2 max-h-[90vh]  rounded-sm border border-black/40 p-4">
                        <NewPostModal
                            onSubmit={handlePostSubmit}
                        />

                        <button
                            className="absolute top-1 right-1 bg-red-500 text-xs p-1 text-white cursor-pointer"
                            onClick={() => setDisplayNewPostModal(false)}
                        >
                            X
                        </button>
                    </div>
                </div>
            )}

        </>
    )
}