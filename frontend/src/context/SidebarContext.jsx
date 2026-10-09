'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SidebarContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
  close: () => {},
  open: () => {},
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar drawer automatically when navigating to another route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scrolling on mobile when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      toggle: () => {},
      close: () => {},
      open: () => {},
    };
  }
  return context;
}
