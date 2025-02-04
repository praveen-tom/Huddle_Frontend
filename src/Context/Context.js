import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) =>{

    const [user,setUser] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);

    const login = (UserDetails) => {
        console.log("Login called with:", UserDetails); // Debug current user state
        setUser(UserDetails);
        console.log("After setting user:", UserDetails);  
    };  

    const logout = () =>{
        setUser(null);
    };

    const Notification = (count) => {
        setNotificationCount(count);// Placeholder for Notification
    };

    return(
        <UserContext.Provider value={{user,login,logout,notificationCount,Notification}}>
            {children}
        </UserContext.Provider>
    );
};