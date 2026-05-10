import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, Card, Input, PageWrap, PrimaryButton } from "../components/ui";

const BASE = "http://localhost:7250";

function Login({ setUser }) {
    const [name, setName] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        setError("");
        try {
            const res = await fetch(`${BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, pin }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid credentials");
                return;
            }

            const user = {
                id: data.id,
                name: data.name,
                role: data.role,
                dept: data.dept,
            };

            localStorage.setItem("user", JSON.stringify(user));
            if (setUser) setUser(user);

            if (data.name.toLowerCase() === "admin") {
                navigate("/admin");
            } else {
                navigate("/employee");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        }
    };

    return (
        <AppShell>
            <div className="flex min-h-screen items-center justify-center">
                <PageWrap max="max-w-md">
                    <div className="mb-8 text-center">
                        <img
                            src="/CySeck.png"
                            alt="CySecK logo"
                            className="mx-auto mb-3 h-14 w-14 rounded-xl object-cover"
                        />
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                            CySecK Assessment 2
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Structured feedback
                        </p>
                    </div>

                    <Card className="px-6 py-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-medium text-slate-800">Welcome back</h2>
                            <p className="mt-1 text-sm text-slate-500">Login to continue</p>
                        </div>

                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <Input
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="mb-3 text-sm text-rose-500">{error}</p>
                        )}

                        <PrimaryButton
                            onClick={login}
                            className="w-full"
                        >
                            Login
                        </PrimaryButton>
                    </Card>
                </PageWrap>
            </div>
        </AppShell>
    );
}

export default Login;