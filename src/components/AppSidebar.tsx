
import { Link } from 'react-router-dom';

export default function AppSidebar(){
  return (
    <aside className="w-56 bg-[#1A0F00] text-[#C49A3C] min-h-screen p-4">
      <h1 className="font-serif text-xl mb-6">MirrorAI</h1>
      <nav className="flex flex-col gap-3">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard/events">Events</Link>
        <Link to="/dashboard/upload">Upload</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
    </aside>
  )
}
