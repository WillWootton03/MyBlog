import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

interface SidebarProps {
    admin_key?: string;
}

interface StatusData {
    title: string;
    body: string;
}

interface DetailData {
    bio: string;
    email: string;
} 

const API_URL = import.meta.env.VITE_API_URL;

const PLACEHOLDER_BIO = 'Hello, my name is William welcome to my little corner of the internet. This is a personal project and portfolio where I talk about anything I come across.';
const PLACEHOLDER_EMAIL = 'wwootton03@gmail.com';

export default function Sidebar({
    admin_key
}: SidebarProps) {
    const navigate = useNavigate();

    const [tags, setTags] = useState<string[]>(['programming', 'agot', 'history', 'bodybuilding']);
    const [statuses, setStatuses] = useState<StatusData[]>([{title: 'Reading', body: 'The Summer Book'}]);

    const [isEditingTag, setIsEditingTag] = useState(false);
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editTag, setEditTag] = useState('');

    const [bio, setBio] = useState(PLACEHOLDER_BIO);
    const [email, setEmail] = useState(PLACEHOLDER_EMAIL);

    let init_bio = PLACEHOLDER_BIO;
    let init_email = PLACEHOLDER_EMAIL;


    const key = admin_key;

/*
    useEffect(() => {
        const cached_tags = localStorage.getItem('tags');
        if (cached_tags) {
            const found_tags = JSON.parse(cached_tags);
            setTags(found_tags);
        }
        else {
            const getTags = async ():Promise<string[]> => {
                const res = await fetch(`${API_URL}/tags`);
                if (res.ok) {
                    return await res.json() as string[];
                } 
                return [];
            }

            const loadTags = async () => {
                const all_tags = await getTags();
                setTags(all_tags);
                localStorage.setItem('tags', JSON.stringify(all_tags));
            }

            loadTags();
        }

        const cached_statuses = localStorage.getItem('statuses');
        if (cached_statuses) {
            const found_statuses = JSON.parse(cached_statuses);
            setTags(found_statuses);
        }
        else {
            const getStatuses = async ():Promise<StatusData[]> => {
                const res = await fetch(`${API_URL}/statuses`);
                if (res.ok) {
                    return await res.json() as StatusData[];
                } 
                return []
            }

            const loadStatuses = async () => {
                const all_statuses = await getStatuses();
                setStatuses(all_statuses);
                localStorage.setItem('statuses', JSON.stringify(all_statuses));
            }

            loadStatuses();
        }

        const cached_details = localStorage.getItem('details');
        if (cached_details){
            const found_details = JSON.parse(cached_details);
            setBio(found_details.bio);
            setEmail(found_details.email);
            init_bio = found_details.bio;
            init_email = found_details.email;
        } else {
            const getDetails = async ():Promise<DetailData> => {
                const res = await fetch(`${API_URL}/details`);
                if (res.ok) {
                    return await res.json() as DetailData;
                }
                return {} as DetailData
            }

            const loadDetails = async () => {
                const all_details = await getDetails();
                setBio(all_details.bio);
                setEmail(all_details.email);
                localStorage.setItem('details', JSON.stringify(all_details));
            }

            loadDetails();
        }

    }, [])
*/
    async function updateDetails() {
        if (key) {
            const res = await fetch(`${API_URL}/details`, {
                method: 'PUT',
                headers: {
                    'X-Admin-Key': key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    bio: bio,
                })
            });
            if (res.ok) {
                console.log('Updated Details');
            }
        }
    }

    async function updateTag() {
        // Base case edited tag is not different 
        if ((editTag == editingTag) || !editTag) {
            return;
        }

        if (key) {
            const res = await fetch(`${API_URL}/tags`, {
                method: 'PUT',
                headers: {
                    'X-Admin-Key': key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag_id: editingTag,
                    updated_tag: editTag,
                })
            });
            if (res.ok) {
                console.log('Updated tag');
            }
        }
    }

    async function deleteTag(tag: string) { 
        if (key) {
            const res = await fetch(`${API_URL}/tags`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Key': key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag_id: tag
                })
            })
            if (res.ok) {
                console.log('Deleted tag');
            }
        }
    }

    function resetEditTag(tag: string) {
        setEditingTag(() => editingTag ? null : tag);
        setEditTag((prev) => editingTag ? '' : prev)
    }

    return (
        <div className="flex flex-col gap-y-4">
            {/* About Me Mini */}
            <div className="flex flex-col w-full gap-y-2">
                <div className="p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] text-left mb-2 flex justify-between">
                    <p>About Me</p>
                    {(init_bio != bio || init_email != email) ? 
                        (<button 
                            onClick={() => updateDetails()}
                            className="cursor-pointer hover:text-purple-900/60"
                        >
                            Save
                        </button>) 
                        : 
                        (<></>)
                    }
                </div>
                <div className="flex">
                    <div className="hidden 2xl:flex h-20 w-20 p-1 border border-black/40 flex-4">
                        <img className="border h-full w-full" alt="image" />
                    </div>
                    {key ? 
                        <textarea 
                            value={bio ? bio : PLACEHOLDER_BIO}
                            onChange={(e) => setBio(e.target.value)}
                            className="flex-7 text-sm px-2"
                        />
                    : 
                        <p className="flex-7 text-sm px-2">
                            {bio ? bio : PLACEHOLDER_BIO }
                        </p>
                    }
                </div>
                {key ? 
                    <input className="text-sm w-fit" value={email} onChange={(e) => setEmail(e.target.value)} />
                    : 
                    <a href={`mailto:${email ? email : PLACEHOLDER_EMAIL}`} className="underline text-purple-900 text-sm w-fit">say hello &gt;&gt;</a>
                }
            </div>
            {/* Other Links */}
            <div className="flex flex-col w-full gap-y-2">
                <div className="p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] text-left mb-2">
                    Elsewhere
                </div>
            </div>
            {/* Tags */}
            <div className="flex flex-col w-full gap-y-2">
                <div className="p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] text-left mb-2">
                    Tags
                </div>
                <div className={`{${key ? 'flex flex-col' : 'grid grid-cols-3'} gap-y-2`}>
                    {tags.map((tag: string) => (
                        <div key={tag} className="flex justify-between">
                                {editingTag == tag
                                ? (
                                    <input 
                                        onChange={(e) => setEditTag(e.target.value)}
                                        onKeyDown={(e) => e.key == 'Enter' ? updateTag()  : ''}
                                        value={editTag ? editTag : tag}
                                    />
                                ) 
                                : (
                                    <p 
                                        className="underline text-purple-900 text-center cursor-pointer hover:text-purple-700"
                                        onClick={() => navigate(`/posts/tags/${tag}`)}
                                    >
                                        {tag}
                                    </p>
                                )}
                            {key ? 
                                (<div className="flex gap-x-2">
                                    <button 
                                        onClick={() => resetEditTag(tag)}
                                        className="cursor-pointer hover:text-purple-800"
                                    >
                                        {editingTag == tag ? 'Cancel' : 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => deleteTag(tag)}
                                        className="cursor-pointer hover:text-red-700"
                                    >
                                        X
                                    </button>
                                </div>) 
                            : (<></>)}
                        </div>
                    ))}
                </div>
            </div>
            {/* Currently */}
            <div className="flex flex-col w-full bg-[rgb(250,245,255)] border-b border-r border-l border-black/20">
                <div className="p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] text-left mb-2">
                    Currently
                </div>
                <div className="px-2 flex flex-col gap-y-2 pb-2">
                    {statuses.map((status) => (
                        <p className="text-sm"><span className="font-bold">{status.title}: </span>{status.body}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}