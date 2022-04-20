import React, { useContext, useState, useRef, useEffect } from "react";
import Realm from "realm";
import id from "../RealmApp";

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(id.currentUser);
  const realmRef = useRef(null);

  useEffect(() => {
    if (!user) {
      console.warn("No User Logged In!");
      return;
    }
    const config = {
      sync: {
        user,
        partitionValue: `user=${user.id}`,
      },
    };

    // Open a realm with the logged in user's partition value in order
    // to get the links that the logged in user added
    Realm.open(config).then((userRealm) => {
      realmRef.current = userRealm;
    });

    return () => {
      // cleanup function
      const userRealm = realmRef.current;
      if (userRealm) {
        userRealm.close();
        realmRef.current = null;
      }
    };
  }, [user]);

  const signIn = async (username, password) => {
    const creds = Realm.Credentials.emailPassword(username, password);
    const newUser = await app.logIn(creds);
    setUser(newUser);
  };

  const signUp = async (username, password, firstname, lastname) => {
    await app.emailPasswordAuth.registerUser({
      username,
      password,
      firstname,
      lastname,
    });
  };

  const signOut = () => {
    if (user == null) {
      console.warn("Not logged in, can't log out!");
      return;
    }
    user.logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error("useAuth() called outside of a AuthProvider?");
  }
  return auth;
};

export { AuthProvider, useAuth };
