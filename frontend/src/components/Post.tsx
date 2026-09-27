import { useNavigate } from "react-router";
import { type PostData } from "../pages/Landing"

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Los_Angeles',
};

export default function Post({
    id,
    date,
    link,
    title,
    body,
    tag_id
}: PostData) {

    const navigate = useNavigate();

    const dateObject: Date = new Date(parseInt(date, 10));
    const formatted_date: string = dateObject.toLocaleDateString('en-US', {...TIME_OPTIONS, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    const formatted_datetime: string = dateObject.toLocaleTimeString('en-US', {...TIME_OPTIONS, hour: 'numeric', minute: '2-digit', hour12: true})

    return (
        <div className="flex flex-col gap-y-4">
            <p className="p-2 bg-[#8a6798] border-b-3 border-[#b598c0] text-white font-semibold">{formatted_date}</p>
            <a 
                onClick={() => navigate(`/posts/${id}`)}
                className="text-3xl underline text-[#56346b] tracking-wide hover:text-[#7d5297] cursor-pointer"
            >
                {title}
            </a>
            <div className="flex p-1 border border-black/20 bg-[#f5ebfc] shadow-sm shadow-[#d9c6f7] items-center justify-center">
                <div className="w-full" style={{aspectRatio: "16/9", overflow: "hidden"}}>
                    <iframe 
                        src={`https://www.youtube.com/embed/${id}?controls=1`}
                        width="100%"
                        height="100%"
                        title="Video"
                        frameBorder="0"
                        allow="
                            accelerometer;
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            gyroscope;
                            picture-in-picture;
                            web-share;
                        "
                        allowFullScreen
                    />
                </div>
            </div>
            <div
                dangerouslySetInnerHTML={{ __html: body, }}
            >
            </div>
            <div>
                <hr style={{ border: 'none', borderTop: '2px dotted #ccc', margin: '6px 0', width: '100%',}}></hr>
                <p 
                    className="text-xs text-black/60"
                >Posted by William at {formatted_datetime} &middot; <a onClick={() => navigate(`/tags/${tag_id}`)} className="underline text-purple-900 cursor-pointer">{tag_id}</a></p>
                <hr style={{ border: 'none', borderTop: '2px dotted #ccc', margin: '6px 0', width: '100%',}}></hr>
            </div>
        </div>  
    )
}