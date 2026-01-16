'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface GlobalContextType {
  location: string;
}

interface GlobalProviderProps {
  children: ReactNode;
  location: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  location 
}) => {
  const value: GlobalContextType = {
    location,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  
  return context;
};