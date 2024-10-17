// import UserHeader from "@/components/UserHeader"
import UserHeader from "../../components/header/UserHeader";

export default function UserLayout({ children }) {
    return (
        <section>
            <UserHeader />
            <div>{children}</div>
        </section>
    );
}
