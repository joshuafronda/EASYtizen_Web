import React, { useState } from "react";
import { User, MapPin, Edit, Save, X } from "lucide-react";
import SettingSection from "./SettingSection";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getBarangayLogo } from '../img/barangaylogos';
import defaultAvatar from '../img/Municipal.png';

const Profile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(user.email);
    const [showPreview, setShowPreview] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { email: email });
            console.log("Updated email:", email);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating email:", error);
        }
    };

    // Get the correct barangay logo
    const getProfileLogo = () => {
        if (!user.barangayName) return defaultAvatar;
        return getBarangayLogo(user.barangayName);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <SettingSection icon={User} title={"Profile"}>
                <div className="flex flex-col sm:flex-row items-center mb-6">
                    {/* Clickable logo preview */}
                    <div 
                        className="rounded-full w-20 h-20 white mr-4 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowPreview(true)}
                    >
                        <img
                            src={getProfileLogo()}
                            alt={`${user.barangayName} Logo`}
                            className="rounded-full w-full h-full object-cover"
                            onError={(e) => {
                                console.log('Error loading barangay logo, using default');
                                e.target.src = defaultAvatar;
                            }}
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold italic text-black">
                            Barangay {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"}
                        </h3>
                        
                        {isEditing ? (
                            <div className="flex items-center">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-3 mb-3 mr-3"
                                    required
                                />
                                <span
                                    onClick={handleSaveClick}
                                    className="cursor-pointer text-[#1679ab]"
                                >
                                    <Save size={25} />
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <p className="text-[#1670ab]">{email}</p>
                                <span
                                    onClick={handleEditClick}
                                    className="cursor-pointer text-[#1679ab]"
                                >
                                    <Edit size={20} className="ml-2" />
                                </span>
                            </div>
                        )}

                        <div className="flex items-center text-gray-600 mt-2">
                            <MapPin size={20} className="mr-2" />
                            <p>Barangay {user.barangayName || "N/A"}</p>
                        </div>
                    </div>
                </div>
            </SettingSection>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4 relative">
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <div className="mt-4">
                            <img
                                src={getProfileLogo()}
                                alt={`${user.barangayName} Logo Large`}
                                className="w-full max-h-[70vh] object-contain"
                                onError={(e) => {
                                    console.log('Error loading barangay logo preview, using default');
                                    e.target.src = defaultAvatar;
                                }}
                            />
                            <p className="text-center mt-4 text-lg font-semibold">
                                Barangay {user.barangayName}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;