import { useState } from "react";
import { useMain } from "../contexts/MainContext";
import { Check, X } from "lucide-react";

export default function SidbarTags() {

    const { tags, newTag, updateTag, deleteTag, key, setPage, getPosts, setCurrentTag } = useMain();

    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editTag, setEditTag] = useState('');


    const [newTagInput, setNewTagInput] = useState(false);
    const [newTagId, setNewTagId] = useState('');

    function resetEditTag() {
        setEditingTag('');
        setEditTag('');
    }

    async function handleNewTag() {
        newTag(newTagId, key);
        setNewTagId('');
        setNewTagInput(false);
    }

    async function handleUpdateTag() {
        if (key && editingTag) {
            updateTag(editingTag, editTag);
            resetEditTag();
        }
    }

    async function handleGetTaggedPosts(tag_id: string) {
        setCurrentTag(tag_id);
        setPage(1);
        getPosts(tag_id, 1);
    }

    return (
        <div className="flex flex-col w-full">
            <div className={`${key ? 'flex justify-between' : ''} w-full p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd]`}>
                <p className="">
                    Tags
                </p>
                {key ? (
                    <button 
                        onClick={() => setNewTagInput(prev => !prev)}
                        className="nav-button px-1 cursor-pointer"
                    >
                        New
                    </button>
                ) : <></> }
            </div>
            <div className={`flex flex-col gap-y-2 bg-white py-1 px-2 border border-black/20`}>
                {newTagInput
                ? (
                    <div className="flex flex-row gap-x-1 justify-between">
                        <input 
                            className="w-full"
                            value={newTagId}
                            placeholder="Tag Id"
                            onChange={(e) => setNewTagId(e.target.value)}
                        />
                        <button 
                            onClick={() => handleNewTag()}
                            className="px-1 bg-blue-300/40 cursor-pointer"
                        >
                            submit
                        </button>
                        <button
                            onClick={() => setNewTagInput(false)}
                            className="px-1 bg-red-500 text-white cursor-pointer"
                        >
                            X
                        </button>
                    </div>
                ) : (<></>)}
                {tags.length > 0 
                ? (
                    <div className={`gap-y-2 w-full ${key ? 'flex flex-col' : 'flex flex-col md:grid md:grid-cols-2 2xl:grid-cols-3 '}`}>
                        {tags.map((tag) => (
                            <div key={tag.id} className={`flex w-full ${key ? 'justify-between' : 'md:justify-center'}`}>
                                {(key && editingTag == tag.id) 
                                ? (
                                    <div className="flex justify-between w-full">
                                        <input 
                                            onChange={(e) => setEditTag(e.target.value)}
                                            onKeyDown={(e) => e.key == 'Enter' ? handleUpdateTag()  : ''}
                                            value={editTag ? editTag : tag.id}
                                        />
                                        {/* Confirm / Deny Buttons */}
                                        <div className="flex gap-x-1">
                                        <button 
                                            onClick={() => handleUpdateTag()}
                                            className="hover:text-blue-500 cursor-pointer hover:bg-black/10 rounded-full"
                                        >
                                                <Check width={20} /> 
                                        </button>
                                        <button 
                                            onClick={() => resetEditTag()}
                                            className="hover:text-red-500 cursor-pointer hover:bg-black/10 rounded-full"
                                        >
                                                <X width={20} />
                                        </button>
                                        </div>
                                    </div>
                                ) 
                                : 
                                (<>
                                    <p 
                                        className="underline text-purple-900 text-center cursor-pointer hover:text-purple-700"
                                        onClick={() => handleGetTaggedPosts(tag.id)}
                                    >
                                        {tag.id}
                                    </p>

                                </>)}
                                {(key && !(editingTag == tag.id))
                                    ? (
                                    <div className="flex gap-x-2">
                                        <button 
                                            onClick={() => setEditingTag(tag.id) }
                                            className="cursor-pointer hover:text-purple-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => key ? deleteTag(tag.id) : ''}
                                            className="cursor-pointer hover:text-red-700"
                                        >
                                            <X width={18} />
                                        </button>
                                    </div>) 
                                : (<></>)}
                            </div>
                        ))}
                    </div>) 
                : (<></>)}
            </div>
        </div>
    )
}

