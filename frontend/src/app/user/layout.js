import UserHeader from "@/components/UserHeader"

export default function UserLayout({ children }) {
  return (
    <section>
      <UserHeader />
      <div>{children}</div>
    </section>
  )
}