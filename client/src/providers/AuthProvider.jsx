import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import app from "../firebase/firebase.init";
import AuthContext from "../contexts/AuthContext";
import useAxiosPublic from "@/hooks/useAxiosPublic";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const AuthProvider = ({ children }) => {
  const syncRef = useRef(sessionStorage.getItem("isSynced") === "true");
  const axiosPublic = useAxiosPublic();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const logOut = async () => {
    setLoading(true);
    sessionStorage.removeItem("isSynced");
    return signOut(auth);
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const controller = new AbortController();

      setUser(currentUser);

      try {
        if (currentUser?.email) {
          if (!syncRef.current) {
            await axiosPublic.post(
              "/auth/jwt",
              { email: currentUser.email },
              { withCredentials: true, signal: controller.signal },
            );
            sessionStorage.setItem("isSynced", "true");
            syncRef.current = true;
          }
        } else {
          if (syncRef.current) {
            syncRef.current = false;
            sessionStorage.removeItem("isSynced");

            await axiosPublic.post(
              "/auth/logout",
              {},
              { withCredentials: true, signal: controller.signal },
            );
            console.log("🛡️ Server-side token nuked.");
          }
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Auth Sync Error:", err.message);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [axiosPublic]);

  const authInfo = {
    user,
    setUser,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    logOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
