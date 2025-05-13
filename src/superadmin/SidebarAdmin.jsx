import { LayoutDashboard, Users, FileText, ScanQrCodeIcon, Megaphone, Menu, LogOut, LandmarkIcon } from "lucide-react";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom"; 
import { auth } from '../firebaseConfig'; 
import logo from '../components/common/img/Municipal.png';

const SIDEBAR_ITEM = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/AnalyticsAdmin" },
    { name: "Barangay", icon: LandmarkIcon, href: "/BarangayLandmark" },
    { name: "Admin", icon: Users, href: "/Admin" }, 
    { name: "Announcement", icon: Megaphone, href: "/Announcement" },
];

const SidebarAdmin = ({ user }) => { // Accept user as a prop
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();

    const handleMouseLeave = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.relatedTarget)) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        console.log("Logout clicked");
        await auth.signOut();
    };

    return (
        <motion.div
            ref={sidebarRef}
            className={`relative z-10 transition-all duration-200 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"}`}
            animate={{ width: isSidebarOpen ? 256 : 80 }}
            onMouseLeave={handleMouseLeave}
        >
            <div className="h-full bg-[#1679AB] backdrop-blur-md p-4 flex flex-col border-r border-black-100">
                <motion.div
                    className='p-3 rounded-full transition-colors max-w-fit cursor-pointer'
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu size={24} color="#FFFFFF" />
                </motion.div>    

                <nav className="mt-8 flex-grow">
                    {SIDEBAR_ITEM.map((item) => (
                        <Link key={item.href} to={item.href}>
                            <motion.div
                                className={`flex items-center p-4 text-sm font-medium rounded-lg transition-colors mb-2 ${location.pathname === item.href ? "bg-white text-[#1679AB]" : "text-white hover:bg-white hover:text-[#1679AB]"}`}
                            >
                                <item.icon 
                                    size={20} 
                                    style={{ color: location.pathname === item.href ? '#1679AB' : 'inherit', minWidth: "20px" }}
                                />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            className='ml-4 whitespace-nowrap'
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2, delay: 0.3 }}
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    ))}
                </nav>

                {/* User Profile Section */}
                {user && (
                    <div className="flex items-center mb-4 mt-4">
                        <img 
                            src={logo} // Use Municipal.png as the default image
                            alt="User Profile"
                            className="w-10 h-10"
                        />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    className={`ml-2  text-white`}
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2, delay: 0.3 }}
                                >
                                    <p className="font-medium">{'President'}</p>
                                    <p className="text-sm">{user.email}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div
                    className="text-white flex items-center p-4 text-sm font-medium rounded-lg hover:bg-white hover:text-[#1679AB] transition-colors mb-2 cursor-pointer"
                    onClick={handleLogout}
                >
                    <LogOut size={20} style={{ color: 'inherit', minWidth: "20px" }} />
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span
                                className='ml-4 whitespace-nowrap'
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.3 }}
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default SidebarAdmin;