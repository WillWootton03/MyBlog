import { useState } from "react";
import { useMain } from "../contexts/MainContext";
import { Check, X } from "lucide-react";


export default function SidebarStatuses() {

    const { statuses,newStatus, deleteStatus, updateStatus, key } = useMain();

    const [currEditingStatus, setCurrEditingStatus] = useState<string | null>('');
    const [editStatusTitle, setEditStatusTitle] = useState('');
    const [editStatusBody, setEditStatusBody] = useState('');

    const [newStatusInput, setNewStatusInput] = useState(false);
    const [newStatusTitle, setNewStatusTitle] = useState('');
    const [newStatusBody, setNewStatusBody] = useState('');

    function handleEditStatus(title: string, body: string) {
        if (key) {
            if (currEditingStatus == title) {
                resetEditStatus(title)
            } else {
                setCurrEditingStatus(title);
                setEditStatusBody(body);
                setEditStatusTitle(title);
            }
        }
    }

    async function handleUpdateStatus(id: string, body: string) {
        if (key) {
            // Verify an update occured
            if (id == editStatusTitle && body == editStatusBody) {
                resetEditStatus(editStatusTitle);
                return;
            }
            updateStatus(id, editStatusTitle, editStatusBody);
            resetEditStatus(editStatusTitle);
        }
    }

    function handleNewStatus() {
        if (key) {
            newStatus(newStatusTitle, newStatusBody);
            resetNewStatus();
        }
    }

    function resetNewStatus() {
        setNewStatusInput(false);
        setNewStatusTitle('');
        setNewStatusBody('');
    }

    function resetEditStatus(status: string) {
        setCurrEditingStatus(() => currEditingStatus ? null : status);
        setEditStatusTitle(prev => currEditingStatus ? '' : prev);
        setEditStatusBody(prev => currEditingStatus ? '' : prev);
    }

    return (
        <div className="flex flex-col w-full bg-[rgb(250,245,255)] border-b border-r border-l border-black/20">
            <div className={`${key ? 'flex justify-between' : ''} w-full p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd] mb-2`}>
                <p className="">
                    Currently
                </p>
                {key ? (
                <button 
                    onClick={() => setNewStatusInput(prev => !prev)}
                    className="nav-button px-1 cursor-pointer"
                >
                    New
                </button>
                ) : <></> }
            </div>
            {newStatusInput 
                ? (
                    <div className="flex flex-row gap-x-1">
                        <input 
                            className="w-20 text-sm"
                            value={newStatusTitle}
                            placeholder="Title"
                            onChange={(e) => setNewStatusTitle(e.target.value)}
                        />
                        <input 
                            className="w-20 text-sm"
                            placeholder="Body"
                            value={newStatusBody}
                            onChange={(e) => setNewStatusBody(e.target.value)}
                        />
                        <button 
                            onClick={() => handleNewStatus()}
                            className="px-1 bg-blue-300/40 cursor-pointer"
                        >
                            submit
                        </button>
                        <button
                            onClick={() => resetNewStatus()}
                            className="px-1 bg-red-500 text-white cursor-pointer"
                        >
                            X
                        </button>
                    </div>
                ) : (<></>)}
            <div className="px-2 flex flex-col gap-y-2 pb-2">
                {statuses.map((status) => (
                    <div className="flex justify-between w-full">
                        <div className="flex gap-x-2 w-full items-center justify-between">
                            {(key && currEditingStatus == status.title) 
                            ? (<div className="flex justify-between w-full">
                                <input 
                                    className="w-20 text-sm"
                                    value={editStatusTitle}
                                    placeholder="Title"
                                    onChange={(e) => setEditStatusTitle(e.target.value)}
                                />
                                <input 
                                    className="w-30 text-sm"
                                    placeholder="Body"
                                    value={editStatusBody}
                                    onChange={(e) => setEditStatusBody(e.target.value)}
                                />
                                <div className="flex gap-x-1">
                                    <button 
                                        onClick={() => handleUpdateStatus(status.title, status.body)}
                                        className="hover:text-blue-500 cursor-pointer hover:bg-black/10 rounded-full"
                                    >
                                            <Check width={20} /> 
                                    </button>
                                    <button 
                                        onClick={() => resetEditStatus(status.title)}
                                        className="hover:text-red-500 cursor-pointer hover:bg-black/10 rounded-full"
                                    >
                                            <X width={20} />
                                        </button>
                                </div>
                            </div>) 
                            : (<>
                                <p className="text-sm font-bold">{status.title}:</p>
                                <p className="text-sm">{status.body}</p>
                            {key ? (
                                <div className="flex gap-x-2">
                                    <button 
                                        onClick={() => handleEditStatus(status.title, status.body) }
                                        className="cursor-pointer hover:text-purple-800 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => key ? deleteStatus(status.title) : ''}
                                        className="cursor-pointer hover:text-red-700"
                                    >
                                        <X width={18} />
                                    </button>
                                </div>) 
                            : (<></>)}
                            </>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}