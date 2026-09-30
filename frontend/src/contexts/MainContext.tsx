import { createContext, useState, useContext, type ReactNode, type SetStateAction, type Dispatch } from "react";

export interface StatusData {
    title: string;
    body: string;
}

export interface DetailData {
    bio: string;
    email: string;
    image_data?: string;
} 

export interface TagData {
    id: string;
}

export interface PostData {
    id: string;
    date: Date;
    link: string;
    title: string;
    body: string;
    tag_id: string;
}

export interface PostInfo {
    year: number;
    month: number;
    count: number;
}

export interface LinkData {
    display: string;
    external_link: string;
}

interface MainContextType {
    posts: PostData[];
    tags: TagData[];
    details: DetailData;
    statuses: StatusData[];
    links: LinkData[];
    imageUrl: string;
    initBio: string;
    initEmail: string;
    key: string;
    page: number;
    currentTag: string;
    postsInfo: PostInfo[],
    currentMonth: number | null;
    currentYear: number | null;
    setCurrentMonth: Dispatch<SetStateAction<number | null>>;
    setCurrentYear: Dispatch<SetStateAction<number | null>>;
    setPostsInfo: Dispatch<SetStateAction<PostInfo[]>>;
    setCurrentTag: Dispatch<SetStateAction<string>>;
    setPage: Dispatch<SetStateAction<number>>;
    setKey: Dispatch<SetStateAction<string>>;
    setTags: Dispatch<SetStateAction<TagData[]>>;
    setStatuses: Dispatch<SetStateAction<StatusData[]>>;
    setBio: Dispatch<SetStateAction<string>>;
    setEmail: Dispatch<SetStateAction<string>>;
    setImageUrl: Dispatch<SetStateAction<string>>;
    setPosts: Dispatch<SetStateAction<PostData[]>>;
    getPosts: (current_tag?: string, inp_page?: number, month?: number, year?: number, reset?: boolean) => void;
    getTags: () => void;
    getStatuses: () => void;
    getDetails: () => void;
    getLinks: () => void;
    getPostsInfo: () => void;
    newTag: (newTagId: string, key?: string) => void;
    updateDetails: (selectedFile: File | null, details: DetailData) => void;
    updateTag: (editingTag: string, editTag: string) => void;
    deleteTag: (tag: string) => void;
    newStatus: (newStatusTitle: string, newStatusBody: string) => void;
    newLink: (newLinkDisplay: string, newLinkExternal: string) => void;
    updateStatus: (statusId: string, statusTitle: string, statusBody: string) => void;
    deleteStatus: (statusTitle: string) => void;
    createPost: (title: string, link: string, body: string, tag_id: string) => void;
    deletePost: (id: string, date: Date) => void;
    updateLink: (id: string, display?: string, external_link?: string) => void;
    deleteLink: (display: string) => void;
    API_URL: string;
    PAGE_SIZE: number;
}

const PLACEHOLDER_BIO = 'Hello, my name is William welcome to my little corner of the internet. This is a personal project and portfolio where I talk about anything I come across.';
const PLACEHOLDER_EMAIL = 'wwootton03@gmail.com';

const MainContext = createContext<MainContextType | undefined>(undefined);

export function MainProvider({ children }: { children: ReactNode }) {
    const [tags, setTags] = useState<TagData[]>([]);
    const [statuses, setStatuses] = useState<StatusData[]>([{title: 'Reading', body: 'The Summer Book'}]);

    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [initBio, setInitBio] = useState(PLACEHOLDER_BIO);
    const [initEmail, setInitEmail] = useState(PLACEHOLDER_EMAIL);
    const [imageUrl, setImageUrl] = useState('');
    const [links, setLinks] = useState<LinkData[]>([]);
    const [page, setPage] = useState(1);

    const [currentTag, setCurrentTag] = useState('');
    const [currentMonth, setCurrentMonth] = useState<number | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    const [key, setKey] = useState('');

    const PAGE_SIZE = 5;

    const [posts, setPosts] = useState<PostData[]>([]);
    const [postsInfo, setPostsInfo] = useState<PostInfo[]>([]);

    const API_URL = import.meta.env.VITE_API_URL;

    function removeTagPages(tag_id: string) {
        let count = 1;
        let clear_all = false;  
        while (true) {
            const tag_cache_key = `posts_t${tag_id}_p${count}`;
            const all_cache_key = `posts_p${count}`;

            const cached__tag_posts = sessionStorage.getItem(tag_cache_key);
            const cached_all_posts = sessionStorage.getItem(`posts_p${count}`);

            if (cached__tag_posts) {
                sessionStorage.removeItem(tag_cache_key);
            }
            if (cached_all_posts) {
                if (clear_all) {
                    sessionStorage.removeItem(all_cache_key);
                } else {
                    let parsed_posts = JSON.parse(cached_all_posts) as PostData[];
                    parsed_posts = parsed_posts.filter((post: PostData) => post.tag_id !== tag_id);
                    if (parsed_posts.length < 5)  {
                        sessionStorage.removeItem(all_cache_key);
                        clear_all = true;
                    }
                }
            }
            if (!cached__tag_posts && !cached_all_posts) {
                break;
            }  
            ++count;
        }   
        return;
    }

    async function getPostsInfo() {
        const cached_info = sessionStorage.getItem('posts_info')
        if (cached_info ) {
            try {
                const post_info = JSON.parse(cached_info)
                setPostsInfo(post_info);
            } catch {
                console.error('Failed to retrieve cached posts');
            }
        } else {
            const res = await fetch(`${API_URL}/info/posts`);
            
            if (res.ok) {
                const new_info = await res.json() as PostInfo[];
                sessionStorage.setItem('posts_info', JSON.stringify(new_info));
                setPostsInfo(new_info);
            } else setPostsInfo([]);
        }
    }

    async function getPosts(current_tag?: string, inp_page?: number, month?: number, year?:number, reset?: boolean) {
        let cached_posts;
        let cache_key;

        const reqMonth = month ?? currentMonth;
        const reqYear = year ?? currentYear;
        const reqPage = inp_page ?? page;
        const reqTag = current_tag;

        if (reset) {
            cache_key = 'posts_p1';
        }
        else if (reqTag) {
            cache_key = `posts_t${reqTag}_p${reqPage}`
        } else if (reqMonth && reqYear) {
            cache_key = `posts_m${month ?? currentMonth}_y${year ?? currentYear}_p${inp_page ?? page}`;
        } else {
            cache_key = `posts_p${inp_page ?? page}`
        } 
            cached_posts = sessionStorage.getItem(cache_key);
            if (cached_posts) {
                try {
                    cached_posts = JSON.parse(cached_posts) as PostData[];
                    setPosts(cached_posts);
                } catch {
                    console.error('Failed to retrieve cached posts');
                }
            } else {
            let res;
            // Fetches posts by degree of importance with reset being top prio, then tag seach, and finally month search
            if (reset) {
                res = await fetch(`${API_URL}/posts?page=1`);
            } else if (current_tag) {
                res = await fetch(`${API_URL}/posts/tags/${reqTag}?page=${reqPage}`) 
            } else if (reqMonth && reqYear) {
                res = await fetch(`${API_URL}/posts?month=${reqMonth}&year=${reqYear}&page=${reqPage}`);
            } else {
                res = await fetch(`${API_URL}/posts?page=${reqPage}`)
            }

            if (res.ok) {
                const new_posts = await res.json() as PostData[];
                setPosts(new_posts);
                sessionStorage.setItem(cache_key, JSON.stringify(new_posts));
            } else {
                setPosts([])
            }
        }
    }

    async function getTags() {
        const cached_tags = sessionStorage.getItem('tags');
        if (cached_tags) {
            const found_tags = JSON.parse(cached_tags);
            setTags(found_tags);
        }
        else {
            const res = await fetch(`${API_URL}/tags`);

            if (res.ok) {
                const all_tags = await res.json() as TagData[];
                setTags(all_tags);
                sessionStorage.setItem('tags', JSON.stringify(all_tags));
            } else {
                setTags([]);
            }
        }
    }

    async function getStatuses() {
        const cached_statuses = sessionStorage.getItem('statuses');
        if (cached_statuses) {
            const found_statuses = JSON.parse(cached_statuses);
            setStatuses(found_statuses);
        }
        else {
            const res = await fetch(`${API_URL}/statuses`);

            if (res.ok) {
                const all_statuses = await res.json() as StatusData[];
                setStatuses(all_statuses);
                sessionStorage.setItem('statuses', JSON.stringify(all_statuses));
            } else {
                setStatuses([])
            }
        }
    }


    async function getLinks() {
        const cached_links = sessionStorage.getItem('links');
        if (cached_links) {
            const found_links = JSON.parse(cached_links);
            setLinks(found_links);
        }
        else {
            const res = await fetch(`${API_URL}/links`);

            if (res.ok) {
                const all_links = await res.json() as LinkData[];
                setLinks(all_links);
                sessionStorage.setItem('links', JSON.stringify(all_links));
            } else {
                setLinks([]);
            }
        }
    }

    async function getDetails() {
        const cached_details = sessionStorage.getItem('details');
        if (cached_details){
            const found_details = JSON.parse(cached_details);
            setBio(found_details.bio || PLACEHOLDER_BIO);
            setEmail(found_details.email || PLACEHOLDER_EMAIL);
            setImageUrl(found_details.image_data || '');
            setInitBio(found_details.bio);
            setInitEmail(found_details.email);
        } else {
            const res = await fetch(`${API_URL}/details`);

            if (res.ok) {
                const all_details = await res.json() as DetailData;
                setBio(all_details.bio);
                setEmail(all_details.email);
                setImageUrl(all_details.image_data || '');
                setInitBio(all_details.bio);
                setInitEmail(all_details.email);
                sessionStorage.setItem('details', JSON.stringify(all_details));
            } else {
                setBio('');
                setEmail('');
                setImageUrl('');
            }
        }
    }
    
    async function newTag(newTagId: string, key?: string) {
        if (key) {
            const res = await fetch(`${API_URL}/admin/tags`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag_id: newTagId,
                })
            });
            if (res.ok) {
                const new_tags: TagData[] = [...tags, { id: newTagId }]; 
                setTags(new_tags); 
                sessionStorage.setItem('tags', JSON.stringify(new_tags));
                console.log('New Tag created');
            }
        }
    }

    async function createPost(title: string, link: string, body: string, tag_id: string) {
        if (key) { 
            const res = await fetch(`${API_URL}/admin/posts/`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': key,
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({                    
                    title: title,
                    link: link,
                    body: body,
                    tag_id: tag_id,})
            });
            if (res.ok) {
                const data = await res.json();
                const new_post = data.post as PostData;
                if (data.tag) {
                    console.log(data.tag);
                    const new_tag = data.tag as TagData;
                    const new_tags = [...tags, new_tag];
                    sessionStorage.setItem('tags', JSON.stringify(new_tags));
                    setTags(new_tags);
                }
                await getPosts();

                const new_date = new Date(new_post.date);
                setPostsInfo(prev => {
                    const month = new_date.getUTCMonth() + 1;
                    const year = new_date.getUTCFullYear();

                    if (prev.length === 0) {
                        const new_posts_info = [{ month, year, count: 1}] as PostInfo[];
                        sessionStorage.setItem('posts_info', JSON.stringify(new_posts_info));
                        return new_posts_info;
                    }

                    let found = false;

                    const new_posts_info = prev.map(item => {
                        if (item.month === month && item.year === year) {
                            found = true;
                            return {...item, count: item.count + 1};
                        }
                        return item;
                    });

                    if (!found) {
                        new_posts_info.push({month, year, count: 1});
                    }
                    sessionStorage.setItem('posts_info', JSON.stringify(new_posts_info));
                    return new_posts_info;
                });
            }
        }
    }
        
    async function updateDetails(selectedFile: File | null, details: DetailData) {
        if (key) {
            const payload = new FormData();
            if(selectedFile) payload.append('file', selectedFile);
            payload.append('bio', details.bio);
            payload.append('email', details.email);

            const res = await fetch(`${API_URL}/admin/details`, {
                method: 'PUT',
                headers: {
                    'X-Admin-Key': key,
                },
                body: payload
            });
            if (res.ok) {
                console.log('Updated Details');
            }
        }
    }
    
        async function updateTag(editingTag: string, editTag: string) {
            // Base case edited tag is not different 
            if ((editTag == editingTag) || !editTag) {
                return;
            }
            if (key) {
                const res = await fetch(`${API_URL}/admin/tags`, {
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
                    const new_tags = tags.map(item => item.id == editingTag ? {...item, id: editTag } : item);
                    setTags(new_tags);
                    sessionStorage.setItem('tags', JSON.stringify(new_tags));
                    console.log('Updated tag');
                }
            }
        }

        
        async function updateLink(id: string, display?: string, external_link?: string) {
            if (!display && !external_link) return;
            if (key) {
                const res = await fetch(`${API_URL}/admin/links/${id}`, {
                    method: 'PUT',
                    headers: {
                        'X-Admin-Key': key,
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify({display, external_link} as LinkData)
                });

                if (res.ok) {
                    const updated_link = await res.json() as LinkData;
                    console.log(updated_link);
                    const new_links = links.map(item => item.display == id ? updated_link : item);
                    sessionStorage.setItem('links', JSON.stringify(new_links));
                    setLinks(new_links);
                }
            }
        }

        async function deleteLink(display: string) {
            if (key) {
                const res = await fetch(`${API_URL}/admin/links/${display}`, {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Key': key,
                    },
                });

                if (res.ok) {
                    const new_links = links.filter(item => item.display != display);
                    sessionStorage.setItem('links', JSON.stringify(new_links));
                    setLinks(new_links);
                    console.log('Deleted Link');
                }
            }
        }
    
        async function deleteTag(tag: string) { 
            if (key) {
                const res = await fetch(`${API_URL}/admin/tags/${tag}`, {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Key': key,
                    },
                })
                if (res.ok) {
                    const new_tags = tags.filter((item) => item.id != tag)
                    setTags(new_tags);
                    sessionStorage.setItem('tags', JSON.stringify(new_tags));
                    await getPosts();
                    console.log('Deleted tag');
                }
                removeTagPages(tag);
                getPostsInfo();
            }
        }

        async function deletePost(id: string, date: Date) {
            if (key) {
                const res = await fetch(`${API_URL}/admin/posts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Key': key,
                    },
                });
                if (res.ok) {
                    getPosts();
                    console.log('Deleted Post');
                }
                const format_date = new Date(date);
                const new_posts_info = postsInfo.map(item => item.month === format_date.getUTCMonth() + 1 && item.year === format_date.getUTCFullYear()
                    ? {...item, count: item.count - 1} 
                    : item 
                ).filter(item => item.count > 0);

                setPostsInfo(new_posts_info);
                sessionStorage.setItem('posts_info', JSON.stringify(new_posts_info));
            }
        }
    
        async function newStatus(newStatusTitle: string, newStatusBody: string) {
            if (key) {
                const res = await fetch(`${API_URL}/admin/statuses`, {
                    method: 'POST',
                    headers: {
                        'X-Admin-Key': key,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: newStatusTitle,
                        body: newStatusBody,
                    })
                });
                if (res.ok) {
                    const new_statuses = [...statuses, { title: newStatusTitle, body: newStatusBody }] as StatusData[];
                    setStatuses(new_statuses);
                    sessionStorage.setItem('statuses', JSON.stringify(new_statuses));
                    console.log('New Status created');
                }
            }
        }
    
    
        async function newLink(newLinkDisplay: string, newLinkExternal: string) {
            if (key) {
                const res = await fetch(`${API_URL}/admin/links`, {
                    method: 'POST',
                    headers: {
                        'X-Admin-Key': key,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        display: newLinkDisplay,
                        external_link: newLinkExternal,
                    })
                });
                if (res.ok) {
                    const new_link = await res.json() as LinkData
                    const new_links = [...links, new_link] as LinkData[];
                    setLinks(new_links);
                    sessionStorage.setItem('links', JSON.stringify(new_links));
                    console.log('New Link created');
                }
            }
        }

        async function updateStatus(statusId: string, statusTitle: string, statusBody: string) {
            if(key) {
                const res = await fetch(`${API_URL}/admin/statuses`, {
                    method: 'PUT',
                    headers: {
                        'X-Admin-Key': key,
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({id: statusId,title: statusTitle, body: statusBody}),
                });

                if (res.ok) {
                    const new_statuses = statuses.map(item => item.title === statusId ? {title: statusTitle, body: statusBody} : item);
                    setStatuses(new_statuses);
                    sessionStorage.setItem('statuses', JSON.stringify(new_statuses));
                    console.log('Updated Statuses');
                }
            }
        }

        async function deleteStatus(statusTitle: string) {
            if(key) {
                const res = await fetch(`${API_URL}/admin/statuses/${statusTitle}`, {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Key': key,
                    },
                });
                if (res.ok) {
                    const new_statuses = statuses.filter(item => item.title != statusTitle);

                    sessionStorage.setItem('statuses', JSON.stringify(new_statuses));
                    setStatuses(new_statuses);
                    console.log('Delete status')
                }
            }
        }

    return (
        <MainContext 
            value={{ 
                posts, 
                tags,
                statuses, 
                details: {bio: bio, email: email},
                links,
                initBio,
                initEmail,
                imageUrl,
                key,
                page,
                currentTag,
                postsInfo,
                currentMonth,
                currentYear,
                setCurrentMonth,
                setCurrentYear,
                getPostsInfo,
                setPostsInfo,
                setCurrentTag,
                setPage,
                setKey,
                setTags,
                setStatuses,
                setBio,
                setEmail,
                setImageUrl,
                setPosts,
                getPosts,
                getTags,
                getStatuses,
                getDetails,
                newTag,
                createPost,
                updateTag,
                updateDetails,
                deleteTag, 
                newStatus,
                newLink,
                updateStatus,
                deleteStatus,
                deletePost,
                getLinks,
                updateLink,
                deleteLink,
                API_URL,
                PAGE_SIZE,
            }}
        >
        {children}
        </MainContext>
    );
}

export function useMain() {
    const context = useContext(MainContext);
    if (!context) {
        throw new Error('useMain must be used within a main provider');
    }
    return context;
}