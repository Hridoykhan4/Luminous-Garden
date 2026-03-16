import { AiOutlineMenu } from "react-icons/ai";
import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router";
import avatarImg from "../../../assets/images/placeholder.jpg";
import logo from "../../../assets/images/logoPlants.png";
import useAuth from "../../../hooks/useAuth";
import LuminousLogo from "../LuminousLogo/LuminousLogo";
const Navbar = () => {
  const { user, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

    const navLinkStyle = ({ isActive }) =>
      `relative py-2 text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
        isActive ? "text-primary" : "text-base-content/70 hover:text-primary"
      }`;


  const navLinks = useMemo(() => {
    const links = [
      { label: "Home", to: "/" },
      { label: "About", to: "/about" },
    ];
    return links;
  }, []);

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {navLinks.map((link) => (
              <li>
                <NavLink key={link.to} className={navLinkStyle} to={link.to}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <LuminousLogo></LuminousLogo>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li>
              <NavLink key={link.to} className={navLinkStyle} to={link.to}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        <a className="btn">Button</a>
      </div>
    </div>
  );

  //   return (
  //     <div className="w-full bg-white z-10 shadow-sm">
  //       <div className="border-b-[1px]">
  //         <div className="flex flex-row  items-center justify-between gap-3 md:gap-0">
  //           <Link to="/">
  //             <img src={logo} alt="logo" width="100" height="100" />
  //           </Link>

  //           <div className="relative">
  //             <div className="flex flex-row items-center gap-3">
  //               <div
  //                 onClick={() => setIsOpen(!isOpen)}
  //                 className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
  //               >
  //                 <AiOutlineMenu />
  //                 <div className="hidden md:block">
  //                   <img
  //                     className="rounded-full"
  //                     referrerPolicy="no-referrer"
  //                     src={user && user.photoURL ? user.photoURL : avatarImg}
  //                     alt="profile"
  //                     height="30"
  //                     width="30"
  //                   />
  //                 </div>
  //               </div>
  //             </div>
  //             {isOpen && (
  //               <div className="absolute rounded-xl shadow-md w-[40vw] md:w-[10vw] bg-white overflow-hidden right-0 top-20 text-sm">
  //                 <div className="flex flex-col cursor-pointer">
  //                   <Link
  //                     to="/"
  //                     className="block md:hidden px-4 py-3 hover:bg-neutral-100 transition font-semibold"
  //                   >
  //                     Home
  //                   </Link>

  //                   {user ? (
  //                     <>
  //                       <Link
  //                         to="/dashboard"
  //                         className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
  //                       >
  //                         Dashboard
  //                       </Link>
  //                       <div
  //                         onClick={logOut}
  //                         className="px-4 py-3 hover:bg-neutral-100 transition font-semibold cursor-pointer"
  //                       >
  //                         Logout
  //                       </div>
  //                     </>
  //                   ) : (
  //                     <>
  //                       <Link
  //                         to="/login"
  //                         className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
  //                       >
  //                         Login
  //                       </Link>
  //                       <Link
  //                         to="/signup"
  //                         className="px-4 py-3 hover:bg-neutral-100 transition font-semibold"
  //                       >
  //                         Sign Up
  //                       </Link>
  //                     </>
  //                   )}
  //                 </div>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
};

export default Navbar;
