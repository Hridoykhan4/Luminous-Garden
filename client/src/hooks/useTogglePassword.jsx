import { useState } from "react";

const useTogglePassword = () => {
    const [showPass, setShowPass] = useState(false)
    const togglePass = () => setShowPass(prev => !prev)
    return {showPass, togglePass, type: showPass ? 'text' : 'password'}
};

export default useTogglePassword;