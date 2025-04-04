import React, { createContext, useState,useEffect  } from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) =>{

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
      });
    const [notificationCount, setNotificationCount] = useState(0);

    const login = (UserDetails) => {
        console.log("Login called with:", UserDetails); 
        setUser(UserDetails);
        localStorage.setItem("user", JSON.stringify(UserDetails)); 
        console.log("After setting user:", UserDetails);  
    };  

    const logout = () =>{
        setUser(null);
        localStorage.removeItem("user"); 
    };

    const Notification = (count) => {
        setNotificationCount(count);
    };
    
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
      }, []);
    return(
        <UserContext.Provider value={{user,login,logout,notificationCount,Notification}}>
            {children}
        </UserContext.Provider>
    );
};