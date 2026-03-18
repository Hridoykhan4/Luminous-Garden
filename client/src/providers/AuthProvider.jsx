import { useEffect, useState } from "react";
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

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const AuthProvider = ({ children }) => {
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
      setUser(currentUser);

      if (currentUser?.email) {
        const isSessionSynced = sessionStorage.getItem("isSynced");

        if (!isSessionSynced) {
          try {
            const userInfo = {
              name: currentUser.displayName,
              email: currentUser.email,
              photo: currentUser.photoURL,
            };

            // FIXED: One await for both, and added withCredentials
            await Promise.all([
              axiosPublic.post(
                `/auth/jwt`,
                { email: currentUser.email },
                { withCredentials: true },
              ),
              axiosPublic.post(`/users`, userInfo),
            ]);

            sessionStorage.setItem("isSynced", "true");
          } catch (err) {
            console.error("Auth Sync Error:", err);
          }
        }
      } else {
        sessionStorage.removeItem("isSynced");
        // Added withCredentials for logout too to clear the cookie properly
        await axiosPublic.get("/auth/logout", { withCredentials: true });
      }
      setLoading(false);
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
