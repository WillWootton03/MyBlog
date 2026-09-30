import { useState } from "react";
import { useMain } from "../contexts/MainContext";
import AdminPostPreview from "../pages/AdminPostPreview";

interface NewPostModalProps {
    onSubmit(title: string, body: string, link: string, tag_id: string): Promise<void>;
}

export default function NewPostModal({
    onSubmit,
}: NewPostModalProps) {

    const { tags } = useMain();

    const [displayPreview, setDisplayPreview] = useState(false);

    const [postTitle, setPostTitle] = useState('');
    const [videoId, setVideoId] = useState('');
    const [postBody, setPostBody] = useState('');
    const [setTag, setSetTag] = useState(tags.length > 0 ? tags.at(0)?.id : '');

    const [newTagId, setNewTagId] = useState('');
    const [isNewTag, setIsNewTag] = useState(false);


    function handleTagTypeSwitch() {
        setIsNewTag((prev) => !prev);
        setNewTagId('');
    }


    return (
        <div className="flex items-center justify-between flex-col w-full h-200 border border-black/30 p-2 gap-y-4 ">
            {displayPreview ? (
                <AdminPostPreview 
                    title={postTitle}
                    body={postBody}
                    tag_id={setTag ? setTag: ''}
                    video_id={videoId}
                />
            ) : (
                <div className="flex flex-col gap-y-4 w-full h-full items-center overflow-auto">
                    <input 
                        className="text-center text-2xl"
                        placeholder="Post Title"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                    />
                    <input 
                        className="text-center"
                        placeholder="Youtube Id"
                        value={videoId}
                        onChange={(e) => setVideoId(e.target.value)}
                    />
                    {tags.length > 0 ? (
                        <div className="flex gap-x-2">
                            {isNewTag 
                            ? (
                                <input 
                                    onChange={(e) => setNewTagId(e.target.value)}
                                    placeholder="New Tag"
                                />
                            ) : (
                                <select
                                    value={setTag}
                                    onChange={(e) => setSetTag(e.target.value)}
                                >
                                    {tags.map((tag) => (
                                        <option
                                            value={tag.id}
                                        >
                                            {tag.id}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button 
                                onClick={() => handleTagTypeSwitch()}
                                className="px-1 hover:bg-black/10 cursor-pointer hover:text-blue-500"
                            >
                                {isNewTag ? 'New Tag' : 'Select Tag'}
                            </button>
                        </div>
                    ) : (
                        <input 
                            placeholder="New Tag"
                            className="text-center"
                            value={setTag}
                            onChange={(e) => setSetTag(e.target.value)}
                        />
                    )
                    }
                    <textarea 
                        className="text-center w-full flex-1"
                        placeholder="Post Body"
                        value={postBody}
                        onChange={(e) => setPostBody(e.target.value)}
                    />
                    <div 
                        dangerouslySetInnerHTML={{ __html: postBody}}
                        className="text-lg text-left h-full overflow-y-auto w-full flex-2"
                    >
                    </div>
                </div>
                    )}
            <div className="flex gap-x-1">
                <button 
                    className="bg-purple-800 text-white px-2 py-1 cursor-pointer"
                    onClick={() => setDisplayPreview((prev) => !prev)}
                >
                    Preview
                </button>
                <button 
                    className="bg-blue-800 text-white px-2 py-1 cursor-pointer"
                    onClick={() => onSubmit(postTitle, postBody, videoId, isNewTag ? newTagId : setTag ? setTag : "")}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}