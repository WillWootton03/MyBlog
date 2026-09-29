import React, { useEffect, useRef, useState } from "react";
import { useMain } from "../contexts/MainContext";
import SidebarStatuses from "./SidebarStatuses";
import SidbarTags from "./SidebarTags";
import SidebarLinks from "./SidebarLinks";
import SidebarMonthlySelect from "./SidebarMonthlySelect";

const PLACEHOLDER_BIO = 'Hello, my name is William welcome to my little corner of the internet. This is a personal project and portfolio where I talk about anything I come across.';
const PLACEHOLDER_EMAIL = 'wwootton03@gmail.com';

export default function Sidebar() {

    const { details, initBio, initEmail, imageUrl, API_URL, 
        setBio, setEmail, setImageUrl,  getDetails, getStatuses, getTags,
        updateDetails, key, getLinks, getPostsInfo,
    } 
    = useMain();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getDetails();
        getTags();
        getStatuses();
        getLinks();
        getPostsInfo(true);
    }, []);


    function selectNewImage() {
        fileInputRef.current?.click();
    }

    function handleFilechange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const localPreview = URL.createObjectURL(file);
            setImageUrl(localPreview);
        }
    }

    async function handleUpdateDetails() {
        if (key) {
            updateDetails(selectedFile, details);
        }
    }

    return (
        <div className="flex flex-col gap-y-4">
            {/* About Me Mini */}
            <div className="flex flex-col w-full gap-y-2">
                <div className="p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] text-left mb-2 flex justify-between">
                    <p>About Me</p>
                    {(initBio != details.bio || initEmail != details.email || imageUrl.startsWith('blob:')) && key ? 
                        (<button 
                            onClick={() => handleUpdateDetails()}
                            className="cursor-pointer hover:text-purple-900/60"
                        >
                            Save
                        </button>) 
                        : 
                        (<></>)
                    }
                </div>
                <div className="flex">
                    <div className="hidden 2xl:flex min-h-full w-20 p-1 border border-black/40 flex-4">
                        <input 
                            className="hidden"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFilechange}
                        />
                        <img 
                            onClick={() => key ? selectNewImage() : null}
                            className={`border h-full w-full ${key ? 'cursor-pointer' : 'cursor-auto'}`} src={imageUrl.startsWith('blob:') ? imageUrl : `${API_URL}${imageUrl}`} alt="image" 
                        />
                    </div>
                    {key ? 
                        <textarea 
                            value={details.bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="flex-7 text-sm px-2"
                        />
                    : 
                        <p className="flex-7 text-sm px-2">
                            {details.bio}
                        </p>
                    }
                </div>
                {key ? 
                    <input className="text-sm w-fit" value={details.email} onChange={(e) => setEmail(e.target.value)} />
                    : 
                    <a href={`mailto:${details.email}`} className="underline text-purple-900 text-sm w-fit">say hello &gt;&gt;</a>
                }
            </div>
            {/* Other Links */}
            <SidebarLinks />
            {/* Archive */}
            <SidebarMonthlySelect />
            {/* Tags */}
            <SidbarTags />
            {/* Currently */}
            <SidebarStatuses />
        </div>
    )
}