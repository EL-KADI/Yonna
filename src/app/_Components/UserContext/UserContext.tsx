"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  _id: string; 
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo: string;
}

interface UserContextType {
  userData: UserData | null;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  userData: null,
  fetchUserData: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("Token");
      if (!token) return;

      const response = await fetch("https://linked-posts.routemisr.com/users/profile-data", {
        method: "GET",
        headers: {
          token: token,
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "User-Agent": "PostmanRuntime/7.43.0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Token")) {
      fetchUserData();
    }
  }, []);

  return (
    <UserContext.Provider value={{ userData, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);