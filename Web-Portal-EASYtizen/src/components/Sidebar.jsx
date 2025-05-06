import { LayoutDashboard, Users, FileText, ScanQrCodeIcon, Megaphone, Menu, LogOut, ClipboardPlus, Landmark, HelpCircle } from "lucide-react"; 
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom"; 
import { auth } from '../firebaseConfig'; 

const SIDEBAR_ITEM = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/Analytics" },
    { name: "Barangay", icon: Landmark, href: "/Barangay" },
    { name: "Barangay Officials", icon: Users, href: "/BrgyOfficial" },
];

const NESTED_TABS = [
    { name: "Barangay Clearance", href: "/RequestDoc/BarangayClearance" },
    { name: "Certificate of Residency", href: "/RequestDoc/CertificateOfResidency" },
    { name: "Certificate of Indigency", href: "/RequestDoc/CertificateOfIndigency" },
];

const ADDITIONAL_ITEMS = [
    { name: "Request Documents", icon: FileText, href: "/RequestDoc" },
    { name: "Blotter Record", icon: ClipboardPlus, href: "/BlotterRecord" },
    { name: "QrCode Scanning", icon: ScanQrCodeIcon, href: "/QrCodeScanning" },
    { name: "Announcement", icon: Megaphone, href: "/Announcement" },
];

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRequestDocOpen, setIsRequestDocOpen] = useState(false); 
    const sidebarRef = useRef(null);
    const location = useLocation();

    const handleLogout = async () => {
        console.log("Logout clicked");
        await auth.signOut();
    };

    return (
        <motion.div
            ref={sidebarRef}
            className={`relative z-10 transition-all duration-200 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"}`}
            animate={{ width: isSidebarOpen ? 256 : 80 }}
        >
            <div className="h-full bg-[#1679AB] backdrop-blur-md p-4 flex flex-col border-r border-black-100">
                <motion.div
                    className='p-3 rounded-full transition-colors max-w-fit cursor-pointer'
                    onClick={() => {
                        setIsSidebarOpen(!isSidebarOpen);
                        if (isSidebarOpen) {
                            setIsRequestDocOpen(false); // Close submenu when sidebar closes
                        }
                    }}
                >
                    <Menu size={24} color="#FFFFFF" />
                </motion.div>    

                <nav className="mt-8 flex-grow">
                    {SIDEBAR_ITEM.map((item) => (
                        <div key={item.href}>
                            <Link to={item.href}>
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
                        </div>
                    ))}

                    {/* Section for Request Document and Blotter Record */}
                    <div className="border-t border-white mt-4 pt-2"> {/* Added border for separation */}
                        {ADDITIONAL_ITEMS.map((item, index) => (
                            <div key={item.href}>
                                {/* Add a separator above the Blotter Record item */}
                                {item.name === "Blotter Record" && (
                                    <div className="border-t border-white my-2"></div>
                                )}
                                <Link to={item.href} onClick={() => {
                                    if (item.name === "Request Documents") {
                                        setIsRequestDocOpen(!isRequestDocOpen); // Toggle nested tabs
                                    }
                                }}>
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
                                {item.name === "Request Documents" && isRequestDocOpen && (
                                    <div className="ml-4 pl-4"> {/* Removed shadow and background color */}
                                        {NESTED_TABS.map((nestedItem) => (
                                            <Link key={nestedItem.href} to={nestedItem.href}>
                                                <motion.div
                                                    className={`flex items-center p-2 text-sm font-medium rounded-lg transition-colors mb-1 ${location.pathname === nestedItem.href ? "bg-white text-[#1679AB]" : "text-white hover:bg-white hover:text-[#1679AB]"}`}
                                                >
                                                    <AnimatePresence>
                                                        {isSidebarOpen && (
                                                            <motion.span
                                                                className='ml-2 whitespace-nowrap'
                                                                initial={{ opacity: 0, width: 0 }}
                                                                animate={{ opacity: 1, width: "auto" }}
                                                                exit={{ opacity: 0, width: 0 }}
                                                                transition={{ duration: 0.2, delay: 0.3 }}
                                                            >
                                                                {nestedItem.name}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Help Button */}
                <div
                    className="text-white flex items-center p-4 text-sm font-medium rounded-lg hover:bg-white hover:text-[#1679AB] transition-colors mb-2 cursor-pointer"
                    onClick={() => alert('Mini FAQ or Help Section')}
                >
                    <HelpCircle size={20} style={{ color: 'inherit', minWidth: "20px" }} />
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span
                                className='ml-4 whitespace-nowrap'
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.3 }}
                            >
                                Help
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

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

export default Sidebar;