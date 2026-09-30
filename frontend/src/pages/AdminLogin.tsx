import { useState } from "react"
import { useNavigate } from "react-router";
import { useMain } from "../contexts/MainContext";

export default function AdminLogin() {

    const navigate = useNavigate();
    const { setKey, API_URL } = useMain();

    const [password, setPassword] = useState('');

    console.log(API_URL);

    async function adminLogin() {
        try {
            const res = await fetch(`${API_URL}/admin/login`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                }),
            });

            if (!res.ok) {
                console.error('Failed to login');
            } 

            const data = await res.json();
            const admin_key = data.admin_key;

            if (admin_key) {
                setKey(admin_key);
                navigate('/');
            }

        } catch {
            console.error('Failed Login');
        }
    }

    return (
        <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => adminLogin()}>Login</button>
        </div>
    )
}