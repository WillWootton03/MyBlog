import Post from "../components/Post";
import type { TagData } from "../contexts/MainContext";

interface AdminPostPreviewProps {
    title: string;
    body: string;
    tag_id: string;
    video_id: string;
}


const now = Date.now();

export default function AdminPostPreview({
    title,
    body,
    tag_id,
    video_id,
} : AdminPostPreviewProps) {
    return (
        <div className="flex flex-col flex-3 px-8 border-r border-gray-700/20 h-9/10 w-full">
            <Post
                key={''} 
                id={''}
                date={now.toString()}
                link={video_id}
                title={title}
                body={body}
                tag_id={tag_id}
            /> 
        </div>
    );
}