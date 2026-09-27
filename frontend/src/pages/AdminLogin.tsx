import { useState } from "react"
import { useNavigate } from "react-router";

export default function AdminLogin() {
    const apiUrl = import.meta.env.VITE_API_URL;    

    const navigate = useNavigate();

    const [password, setPassword] = useState('');

    async function adminLogin() {
        try {
            const res = await fetch(`${apiUrl}/admin/login`,{
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
            const key = data.admin_key;

            if (key) {
                navigate('/', { state: { adminKey: key}});
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