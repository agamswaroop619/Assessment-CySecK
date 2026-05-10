import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppShell, Card, PageHeader, PageWrap, SoftButton } from "../components/ui";

function HR({ setUser }) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("user");
        if (setUser) setUser(null);
        navigate("/");
    };

    return (
        <AppShell>
            <PageWrap max="max-w-3xl">
                <PageHeader
                    title="HR Dashboard"
                    right={(
                        <SoftButton onClick={logout} className="flex items-center gap-2">
                            <FiLogOut />
                            Logout
                        </SoftButton>
                    )}
                />
                <Card>
                    <p className="text-sm text-slate-500">HR panel is ready for future modules.</p>
                </Card>
            </PageWrap>
        </AppShell>
    );
}

export default HR;
