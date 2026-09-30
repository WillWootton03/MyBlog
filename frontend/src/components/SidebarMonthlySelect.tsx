import { ChevronRight } from "lucide-react";
import { useMain } from "../contexts/MainContext"

export default function SidebarMonthlySelect() {

    const {  postsInfo, getPosts, currentMonth, currentYear, setCurrentMonth, setCurrentYear, setPage } = useMain();

    // TODO : Fix getting post nfo to only incrememnt and decrement when creating new posts and deleting posts. Except when deleting tags retrieve again for cascade delete

    async function handleInfoSort(year: number, month: number) {
        if (!(currentMonth && currentYear) || !(currentMonth === month && currentYear === currentYear)) {
            setCurrentMonth(month);
            setCurrentYear(year);
            setPage(1);
            getPosts(undefined, 1, month, year);
        } else {
            getPosts();
        }
    }

    async function handleClearFilter() {
        getPosts(undefined, undefined, undefined, undefined, true);
        setCurrentMonth(null);
        setCurrentYear(null);
        setPage(1);
    }

    return (
        <div className="flex flex-col w-full">
            <div className={`flex justify-between w-full p-2 bg-[#8a6798] text-white border-b-2 border-[#af8cbd]`}>
                <p className="">
                    Archive
                </p>
                <button 
                    onClick={() => handleClearFilter()}
                    className="hover:bg-[#a889b4]"
                >
                    Clear
                </button>
            </div>
            <div className={`gap-y-1 bg-white border border-black/20 py-1 px-2`}>
                {postsInfo.map(item => (
                    <a 
                        onClick={() => handleInfoSort(item.year, item.month)}
                        className="text-xs underline text-purple-900 flex gap-x-1 items-center cursor-pointer"
                    >
                        <ChevronRight width={10} /> {item.month} {item.year} ({item.count})
                    </a>
                ))}
            </div>
        </div>
    )
}