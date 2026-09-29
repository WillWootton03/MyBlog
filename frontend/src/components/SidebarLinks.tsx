import { useState } from "react";
import { useMain } from "../contexts/MainContext";
import { Check, X } from "lucide-react";

export default function SidebarLinks() {

    const { newLink, key, links, updateLink, deleteLink } = useMain();

    const [newLinkInput, setNewLinkInput] = useState(false);
    const [newLinkDisplay, setNewLinkDisplay] = useState('');
    const [newLinkExternal, setNewLinkExternal] = useState('');

    const [currentEditingLink, setCurrentEditingLink] = useState('');

    const [updatedLinkDisplay, setUpdatedLinkDisplay] = useState('');
    const [UpdatedLinkExternal, setUpdatedLinkExternal] = useState('');

    async function handleNewLink() {
        if (key) {
            newLink(newLinkDisplay, newLinkExternal);
        }
        handleResetNewLink();
    }

    function handleResetEditLink() {
        setCurrentEditingLink('');
        setUpdatedLinkDisplay('');
        setUpdatedLinkExternal('');
    }

    function handleResetNewLink() {
        setNewLinkInput(false);
        setNewLinkDisplay('');
        setNewLinkExternal('');
    }

    function handleStartEditing(display: string, link: string) {
        setCurrentEditingLink(display);
        setUpdatedLinkDisplay(display);
        setUpdatedLinkExternal(link);
    }

    async function handleUpdateLink(display: string, link: string) {
        if (!(display === updatedLinkDisplay) && (link === UpdatedLinkExternal)) {
            updateLink(currentEditingLink, updatedLinkDisplay, UpdatedLinkExternal);
        }
        handleResetEditLink();
    } 
    
    return (
        <div className="flex flex-col w-full">
            <div className={`${key ? 'flex justify-between' : ''} w-full p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd]`}>
                <p className="">
                    Elsewhere
                </p>
                {key ? (
                <button 
                    onClick={() => setNewLinkInput(prev => !prev)}
                    className="nav-button px-1 cursor-pointer"
                >
                    New
                </button>
                ): <></>}
            </div>
            {newLinkInput 
                ? (
                    <div className="flex flex-row gap-x-1">
                        <input 
                            className="w-20 text-sm"
                            placeholder="Display"
                            value={newLinkDisplay}
                            onChange={(e) => setNewLinkDisplay(e.target.value)}
                        />
                        <input 
                            className="w-20 text-sm"
                            value={newLinkExternal}
                            placeholder="External Link"
                            onChange={(e) => setNewLinkExternal(e.target.value)}
                        />
                        <button 
                            onClick={() => handleNewLink()}
                            className="px-1 bg-blue-300/40 cursor-pointer"
                        >
                            submit
                        </button>
                        <button
                            onClick={() => handleResetNewLink()}
                            className="px-1 bg-red-500 text-white cursor-pointer"
                        >
                            X
                        </button>
                    </div>
                ) : (
                <div className={`gap-y-1 bg-white border border-black/20 py-1 px-2`}>
                    {links.map((item, indx) => (
                        <div  className={`flex justify-between border-b border-black/20 border-dotted ${indx == links.length - 1 ? 'border-transparent' : 'border-black/20'}`}>
                        {(key && currentEditingLink == item.display) 
                            ? (
                                <div className="flex">
                                    <input 
                                        placeholder="Display"
                                        value={updatedLinkDisplay}
                                        onChange={(e) => setUpdatedLinkDisplay(e.target.value)}
                                        className="w-20 text-sm" 
                                    />
                                    <input 
                                        placeholder="Link"
                                        value={UpdatedLinkExternal}
                                        onChange={(e) => setUpdatedLinkExternal(e.target.value)}
                                        className="w-40" 
                                    />
                                </div>
                            ) 
                            : (
                                <a className="underline text-blue-400" target="_blank" href={item.external_link}>{item.display}</a>
                            )}
                            {key ? ( 
                                <div className={`${key ? 'flex gap-x-1' : 'invisible'}`}>
                                    <button
                                        onClick={() => currentEditingLink ? handleUpdateLink(item.display, item.external_link) : handleStartEditing(item.display, item.external_link)}
                                        className="hover:text-purple-700 cursor-pointer"
                                    >
                                        {currentEditingLink ? (<Check />) : 'Edit' }
                                    </button>
                                    <button
                                        onClick={() => currentEditingLink ? handleResetEditLink() : deleteLink(item.display)} 
                                        className="hover:text-red-500 cursor-pointer"
                                    >
                                        <X width={18} />
                                    </button>
                                </div>
                            )
                            : (<></>)}
                        </div>
                    ))}
                </div>
                )}
        </div>
    )
}