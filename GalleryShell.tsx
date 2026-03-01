
import React from 'react';

export default function GalleryShell({title,children}:{title:string,children:React.ReactNode}){
  return (
    <div className="min-h-screen">
      <header className="p-6 text-center font-serif text-2xl">{title}</header>
      <div className="p-4">{children}</div>
      <footer className="text-center text-sm p-6">© MirrorAI</footer>
    </div>
  )
}
