import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, Search, FilePlus, Check, Edit, XCircle, RotateCcw, History, Archive, CheckCircle, Clock } from "lucide-react";
import jsPDF from 'jspdf';
import Modal from 'react-modal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as necessary
import { toast } from 'react-hot-toast';
import defaultLogo from '../common/img/Municipal.png';
import { getBarangayLogo } from '../../components/common/img/barangaylogos';

// Set the app element for accessibility
Modal.setAppElement('#root');

const IndigencyTable = ({ barangayId, user }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequest, setFilteredRequest] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [requestData, setRequestData] = useState({
        id: '',
        name: '',
        age: '',
        certificateType: 'Certificate of Indigency',
        purpose: '',
        requestDate: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }),
        status: 'Pending',
        civilStatus: '',
        barangayId: barangayId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        acceptedAt: null,
        processedAt: null,
        processedBy: null,
        declinedAt: null,
        declinedBy: null
    });
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [barangayOfficials, setBarangayOfficials] = useState([]);
    const [barangayCaptain, setBarangayCaptain] = useState({
        name: '',
        position: ''
    });

    const [userDetails, setUserDetails] = useState({
        barangayName: '',
        email: '',
        phoneNumber: ''
    });

    const [showHistory, setShowHistory] = useState(false);
    const [resolvedRequests, setResolvedRequests] = useState([]);
    const [showDeclined, setShowDeclined] = useState(false);
    const [declinedRequests, setDeclinedRequests] = useState([]);
    const [historySearchTerm, setHistorySearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(null);
    const [archiveYear, setArchiveYear] = useState(null);
    const [filteredArchiveRecords, setFilteredArchiveRecords] = useState([]);
    const [archiveSearchTerm, setArchiveSearchTerm] = useState("");

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                if (!user || !user.uid) return;
    
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserDetails({
                        barangayName: userData.barangayName || '',
                        email: userData.email || '',
                        phoneNumber: userData.phoneNumber || 'N/A'
                    });
                    console.log('Fetched user details:', userData);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
    
        fetchUserDetails();
    }, [user]);
    // Fetch document requests from Firestore
    useEffect(() => {
        if (!barangayId) return;

        // Create query for pending and processing requests
        const q = query(
            collection(db, 'documentRequests'),
            where('barangayId', '==', barangayId),
            where('certificateType', '==', 'Certificate of Indigency'),
            where('status', 'in', ['Pending', 'Processing'])
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('Fetched requests:', requests); // Debug log
            setFilteredRequest(requests);
        }, (error) => {
            console.error("Error fetching requests:", error);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [barangayId]);

    // Add useEffect to fetch officials
    useEffect(() => {
        const fetchOfficials = async () => {
            try {
                if (!barangayId) return;

                const q = query(
                    collection(db, 'barangayOfficials'), 
                    where("barangayId", "==", barangayId)
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const officialsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    
                    // Set all officials
                    setBarangayOfficials(officialsData);
                    console.log('All Officials:', officialsData);
                    
                    // Find and set the Barangay Captain separately
                    const captain = officialsData.find(official => 
                        official.position === "Barangay Captain" && 
                        isTermActive(official.termEnd)
                    );
                    
                    if (captain) {
                        setBarangayCaptain({
                            name: captain.name,
                            position: captain.position
                        });
                        console.log('Found Barangay Captain:', captain);
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching officials:', error);
            }
        };

        fetchOfficials();
    }, [barangayId]);

    // Fetch accepted requests for history
    useEffect(() => {
        if (!barangayId) return;

        const q = query(
            collection(db, 'documentRequests'),
            where('barangayId', '==', barangayId),
            where('certificateType', '==', 'Certificate of Indigency'),
            where('status', '==', 'Accepted')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setResolvedRequests(requestsData);
        }, (error) => {
            console.error("Error fetching accepted documents: ", error);
        });

        return () => unsubscribe();
    }, [barangayId]);

    // Fetch declined requests for archive
    useEffect(() => {
        if (!barangayId) return;

        const q = query(
            collection(db, 'documentRequests'),
            where('barangayId', '==', barangayId),
            where('certificateType', '==', 'Certificate of Indigency'),
            where('status', '==', 'Declined')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDeclinedRequests(requestsData);
        }, (error) => {
            console.error("Error fetching declined documents: ", error);
        });

        return () => unsubscribe();
    }, [barangayId]);

    // Add this useEffect to update the filtered records
    useEffect(() => {
        const filtered = declinedRequests
            .filter(request => {
                const matchesSearch = !archiveSearchTerm || 
                    request.name.toLowerCase().includes(archiveSearchTerm.toLowerCase()) ||
                    request.purpose.toLowerCase().includes(archiveSearchTerm.toLowerCase()) ||
                    request.certificateType.toLowerCase().includes(archiveSearchTerm.toLowerCase());
                
                const matchesYear = !archiveYear || 
                    new Date(request.requestDate).getFullYear() === archiveYear;
                
                return matchesSearch && matchesYear;
            })
            .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        setFilteredArchiveRecords(filtered);
    }, [declinedRequests, archiveSearchTerm, archiveYear]);

    // Add helper function to check if an official's term is active
    const isTermActive = (termEnd) => {
        const today = new Date();
        const endDate = new Date(termEnd);
        return endDate >= today;
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = filteredRequest.filter((request) =>
            request.name.toLowerCase().includes(term) ||
            request.residentName.toLowerCase().includes(term) ||
            request.residentEmail.toLowerCase().includes(term) ||
            request.residentPhone.toLowerCase().includes(term) ||
            request.certificateType.toLowerCase().includes(term) ||
            request.purpose.toLowerCase().includes(term)
        );
        setFilteredRequest(filtered);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setRequestData({
            id: '',
            name: '',
            age: '',
            certificateType: 'Certificate of Indigency',
            purpose: '',
            requestDate: new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }),
            status: 'Pending',
            civilStatus: '',
            barangayId: barangayId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            acceptedAt: null,
            processedAt: null,
            processedBy: null,
            declinedAt: null,
            declinedBy: null
        });
        setFormVisible(false);
        setIsEditMode(false);
    }

    const handleStatusChange = (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can process requests");
            return;
        }
        setSelectedRequest(request);
        setConfirmAction('process');
        setShowConfirmModal(true);
    };
    
    const handlePrintAndAccept = (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can accept requests");
            return;
        }
        setSelectedRequest(request);
        setConfirmAction('accept');
        setShowConfirmModal(true);
    };

    const handleDecline = (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can decline requests");
            return;
        }
        setSelectedRequest(request);
        setConfirmAction('decline');
        setShowConfirmModal(true);
    };


    const handleConfirmAction = async () => {
        if (!confirmAction || !selectedRequest) return;
    
        try {
            const docRef = doc(db, 'documentRequests', selectedRequest.id);
            const timestamp = serverTimestamp();
            
            switch (confirmAction) {
                case 'decline':
                    await updateDoc(docRef, {
                        status: 'Declined',
                        updatedAt: timestamp,
                        declinedBy: user.email,
                        declinedAt: timestamp
                    });
                    toast.success("Request has been declined and moved to archive");
                    break;
                case 'process':
                    await updateDoc(docRef, {
                        status: 'Processing',
                        updatedAt: timestamp,
                        processedBy: user.email,
                        processedAt: timestamp
                    });
                    toast.success("Request is now being processed");
                    break;
                case 'accept':
                    await updateDoc(docRef, {
                        status: 'Accepted',
                        updatedAt: timestamp,
                        acceptedBy: user.email,
                        acceptedAt: timestamp
                    });
                    handleGeneratePdf(selectedRequest);
                    toast.success("Request accepted and moved to history");
                    break;
                case 'restore':
                    await updateDoc(docRef, {
                        status: 'Pending',
                        updatedAt: timestamp,
                        restoredBy: user.email,
                        restoredAt: timestamp,
                        declinedBy: null,
                        declinedAt: null
                    });
                    toast.success("Request has been restored to pending");
                    break;
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(`Failed to ${confirmAction} request: ${error.message}`);
        }
    
        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedRequest(null);
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        
        if (user.role !== 'admin') {
            toast.error("Only admins can modify requests");
            return;
        }

        if (!requestData.name || !requestData.age || !requestData.civilStatus || 
            !requestData.purpose) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            if (isEditMode) {
                await handleEditRequest(requestData);
            } else {
                await addDoc(collection(db, 'documentRequests'), {
                    name: requestData.name,
                    age: parseInt(requestData.age),
                    civilStatus: requestData.civilStatus,
                    purpose: requestData.purpose,
                    certificateType: 'Certificate of Indigency',
                    status: 'Pending',
                    userType: 'Walk-in',
                    requestDate: serverTimestamp(), // Use serverTimestamp instead of Date string
                    barangayId: barangayId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    acceptedAt: null,
                    processedAt: null,
                    processedBy: null,
                    declinedAt: null,
                    declinedBy: null
                });
            }
            
            toast.success(isEditMode ? "Request updated successfully!" : "Request added successfully!");
            resetForm();
            setFormVisible(false);
        } catch (error) {
            console.error("Error processing request:", error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'add'} request: ${error.message}`);
        }
    };
    
    const handleUpdateRequest = async (e) => {
        e.preventDefault();
        
        if (user.role !== 'admin') {
            toast.error("Only admins can edit requests");
            return;
        }
    
        if (!requestData.id) {
            toast.error("Invalid request data");
            return;
        }
    
        // Validate required fields
        if (!requestData.name || !requestData.age || !requestData.civilStatus || !requestData.purpose) {
            toast.error("Please fill in all required fields");
            return;
        }
    
        try {
            const docRef = doc(db, 'documentRequests', requestData.id);
            
            // Get current document data
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error("Request not found");
            }
    
            // Update document
            await updateDoc(docRef, {
                name: requestData.name,
                age: parseInt(requestData.age),
                civilStatus: requestData.civilStatus,
                purpose: requestData.purpose,
                updatedAt: serverTimestamp(),
                status: requestData.status // Preserve the current status
            });
            
            toast.success("Request updated successfully!");
            resetForm();
            setIsEditMode(false);
            setFormVisible(false);
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error(`Failed to update request: ${error.message}`);
        }
    };
    const ConfirmationModal = () => (
        <AnimatePresence>
            {showConfirmModal && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                {confirmAction === 'decline' && (
                                    <>
                                        <div className="bg-red-100 p-4 rounded-full mb-4 shadow-inner">
                                            <XCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                            Decline Request
                                        </h3>
                                        <p className="text-gray-600 text-center max-w-sm mb-8">
                                            Are you sure you want to decline this request? 
                                            <br />
                                            <span className="text-sm text-gray-500 mt-1 block">
                                                This action will move it to the archive.
                                            </span>
                                        </p>
                                    </>
                                )}

                                {confirmAction === 'process' && (
                                    <>
                                        <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-inner">
                                            <Clock className="w-10 h-10 text-[#1679AB]" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                            Process Request
                                        </h3>
                                        <p className="text-gray-600 text-center max-w-sm mb-8">
                                            Would you like to start processing this request?
                                            <br />
                                            <span className="text-sm text-gray-500 mt-1 block">
                                                The status will be updated to "Processing".
                                            </span>
                                        </p>
                                    </>
                                )}

                                {confirmAction === 'accept' && (
                                    <>
                                        <div className="bg-green-100 p-4 rounded-full mb-4 shadow-inner">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                            Accept & Print Request
                                        </h3>
                                        <p className="text-gray-600 text-center max-w-sm mb-8">
                                            Are you sure you want to accept this request?
                                            <br />
                                            <span className="text-sm text-gray-500 mt-1 block">
                                                A certificate will be generated for printing.
                                            </span>
                                        </p>
                                    </>
                                )}

                                {confirmAction === 'restore' && (
                                    <>
                                        <div className="bg-yellow-100 p-4 rounded-full mb-4 shadow-inner">
                                            <RotateCcw className="w-10 h-10 text-yellow-600" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                            Restore Request
                                        </h3>
                                        <p className="text-gray-600 text-center max-w-sm mb-8">
                                            Would you like to restore this request to pending status?
                                            <br />
                                            <span className="text-sm text-gray-500 mt-1 block">
                                                It will be moved back to active requests.
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmAction(null);
                                        setSelectedRequest(null);
                                    }}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 min-w-[120px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 min-w-[120px] 
                                        ${confirmAction === 'decline' 
                                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                                            : confirmAction === 'accept'
                                            ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
                                            : 'bg-[#1679AB] hover:bg-[#136290] shadow-lg shadow-[#1679AB]/30'
                                        }`}
                                >
                                    {confirmAction === 'decline' ? 'Decline' :
                                     confirmAction === 'process' ? 'Process' :
                                     confirmAction === 'accept' ? 'Accept' : 'Restore'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const handleEdit = (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can edit requests");
            return;
        }
    
        try {
            setRequestData({
                id: request.id,
                name: request.name,
                age: request.age.toString(),
                purpose: request.purpose,
                requestDate: request.requestDate,
                status: request.status,
                civilStatus: request.civilStatus,
                certificateType: request.certificateType || 'Certificate of Indigency',
                barangayId: request.barangayId
            });
    
            setIsEditMode(true);
            setFormVisible(true);
        } catch (error) {
            console.error("Error preparing edit form:", error);
            toast.error("Error loading request data");
        }
    };

    const handleGeneratePdf = async (request) => {
        const doc = new jsPDF({
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Function to convert image to base64
        const getBase64Image = (imgUrl) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = reject;
                img.src = imgUrl;
            });
        };

        try {
            // Get the specific barangay logo based on admin's barangay
            const barangayLogo = getBarangayLogo(userDetails.barangayName);
            console.log('Current Admin Barangay:', userDetails.barangayName); // Debug log
            
            // Convert and add the barangay logo
            const barangayLogoBase64 = await getBase64Image(barangayLogo);
            const logoWidth = 35;
            const logoHeight = 35;
            const logoX = 20;
            const logoY = 10;
            doc.addImage(barangayLogoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
            
            // Add watermark logo on the right side
            const watermarkWidth = 100; // Adjust size for watermark
            const watermarkHeight = 100;
            const watermarkX = pageWidth - watermarkWidth - 20; // 20 is the right margin
            const watermarkY = 100; // Adjust this value to position vertically

            // Set opacity for the watermark
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.2 })); // 20% opacity
            doc.addImage(barangayLogoBase64, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
            doc.restoreGraphicsState();

            // Header
            doc.setFontSize(10);
            doc.text("Republic of the Philippines", pageWidth / 2, 15, { align: "center" });
            doc.text("Province of Batangas", pageWidth / 2, 20, { align: "center" });
            doc.text("Municipality of San Pascual", pageWidth / 2, 25, { align: "center" });
            doc.setFontSize(10);
            doc.setFont("Helvetica", "bold");
            doc.text(`BARANGAY ${userDetails.barangayName.toUpperCase()}`, pageWidth / 2, 33, { align: "center" });
            doc.text("OFFICE OF THE SANGGUNIANG BARANGAY", pageWidth / 2, 41, { align: "center" });
            doc.setFontSize(8);
            doc.setFont("Helvetica", "normal");
            doc.text(`Tel no. : ${userDetails.phoneNumber}`, pageWidth / 2, 47, { align: "center" });
            doc.text(`Email add: ${userDetails.email}`, pageWidth / 2, 51, { align: "center" });

            // Divider line
            doc.line(10, 55, pageWidth - 10, 55);

            // Two-column layout
            const leftColumnX = 10;
            const rightColumnX = 80;
            let yPosition = 65;

            // Define positions exactly as they appear in BarangayTable
            const positions = [
                "Barangay Captain",
                "Chairperson, Bids and Awards Committee Ways and Means Social Services",
                "Chairperson, Committee on Infrastracture Agriculture",
                "Chairperson, Committee on Education Environment",
                "Chairperson, Committee on Appropriation Sports and Development Committee on Health",
                "Chairperson, Committee on Health Culture and Tourism",
                "Chairperson, Committee on Peace and Order",
                "Chairperson, Committee on Gender and Development",
                "Chairperson, Sangguniang Kabataan (SK)",
                "Secretary",
                "Treasurer"
            ];

            // Filter and sort active officials
            const activeOfficials = barangayOfficials
                .filter(official => isTermActive(official.termEnd))
                .sort((a, b) => {
                    return positions.indexOf(a.position) - positions.indexOf(b.position);
                });

            console.log('Active Officials for PDF:', activeOfficials);

            // Update the position matching logic to be more flexible
            const sortedOfficials = positions.map(position => {
                const found = activeOfficials.find(official => {
                    const officialPos = official.position.trim().toLowerCase();
                    const targetPos = position.trim().toLowerCase();
                    
                    // Direct match
                    if (officialPos === targetPos) return true;
                    
                    // For Infrastructure/Infrastracture variation
                    if (position.includes('Infrastracture') && 
                        officialPos.includes('infrastructure')) return true;
                    
                    // For committee positions, match by committee name
                    if (position.includes('Committee on') && officialPos.includes('committee on')) {
                        const targetCommittee = position.split('Committee on')[1]?.trim().toLowerCase();
                        const officialCommittee = officialPos.split('committee on')[1]?.trim().toLowerCase();
                        return targetCommittee && officialCommittee && 
                               (officialCommittee.includes(targetCommittee) || 
                                targetCommittee.includes(officialCommittee));
                    }
                    
                    return false;
                });
                
                console.log(`Matching position: ${position}`);
                console.log(`Found official:`, found);
                
                return found || {
                    name: '(Vacant)',
                    position: position,
                    isPlaceholder: true
                };
            });

            console.log('Complete Officials List:', sortedOfficials);

            // Draw officials list
            yPosition = 65;
            doc.setFontSize(12);
            doc.setFont("times", "italic");
            doc.setTextColor("#1679AB");

            // Center the "Barangay Officials" text
            const officialsHeader = "Barangay Officials";
            const officialsHeaderWidth = doc.getTextWidth(officialsHeader);
            const officialsHeaderX = leftColumnX + (rightColumnX - leftColumnX - officialsHeaderWidth) / 2;
            doc.text(officialsHeader, officialsHeaderX, yPosition);
            yPosition += 10;

            // Draw all officials
            sortedOfficials.forEach((official) => {
                const columnWidth = rightColumnX - leftColumnX;

                // Draw name if position is not vacant
                if (!official.isPlaceholder) {
                    const fullName = `Hon. ${official.name}`; // Add HON. prefix
                    const nameWidth = doc.getTextWidth(fullName);
                    const nameX = leftColumnX + (columnWidth - nameWidth) / 2;
                    doc.setTextColor("#1679AB");
                    doc.setFont("times", "italic");
                    doc.text(fullName, nameX, yPosition);
                }

                // Draw position
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont("times", "normal");
                
                const splitTitle = doc.splitTextToSize(official.position, columnWidth);
                splitTitle.forEach((line, index) => {
                    const titleX = leftColumnX + (columnWidth - doc.getTextWidth(line)) / 2;
                    doc.text(line, titleX, yPosition + 4 + (index * 5));
                });

                yPosition += 18;
            });

            // Adjust vertical line height
            const lineStartY = 55;
            const lineEndY = yPosition + 10;
            doc.line(rightColumnX + 2, lineStartY, rightColumnX + 2, lineEndY);

            // Right column: Certificate content
            yPosition = 75;
            doc.setFontSize(16);
            doc.setFont("Helvetica", "bold");

            // Center the "CERTIFICATE OF INDIGENCY" on the right side
            const certificateTitle = request.certificateType.toUpperCase();
            const certificateTitleWidth = doc.getTextWidth(certificateTitle);
            const certificateTitleX = rightColumnX + (pageWidth - rightColumnX - certificateTitleWidth) / 2;
            doc.text(certificateTitle, certificateTitleX, yPosition);
            yPosition += 15;

            doc.setFontSize(10);
            doc.setFont("Helvetica", "normal");

            // Indent specific lines
            const indent = 10; // Double tab
            const justifyText = (text, x, y, width) => {
                const words = text.split(' ');
                let line = '';
                let lineWidth = 0;

                words.forEach((word, index) => {
                    const testLine = line + word + ' ';
                    const testWidth = doc.getTextWidth(testLine);

                    if (testWidth > width && index > 0) {
                        const spaceWidth = (width - lineWidth) / (line.split(' ').length - 1);
                        let justifiedLine = '';
                        line.split(' ').forEach((w, i) => {
                            justifiedLine += w;
                            if (i < line.split(' ').length - 1) {
                                justifiedLine += ' '.repeat(spaceWidth / doc.getTextWidth(' '));
                            }
                        });
                        doc.text(justifiedLine, x, y);
                        line = word + ' ';
                        y += 5;
                        lineWidth = doc.getTextWidth(line);
                    } else {
                        line = testLine;
                        lineWidth = testWidth;
                    }
                });

                doc.text(line.trim(), x, y);
            };

            doc.setFontSize(10);
            doc.setFont("Helvetica", "normal");

            // Indent the heading to avoid overlap with the vertical line
            const headingIndent = 10; // Adjust this value as needed for proper indentation
            const centerY = pageHeight / 2; // Calculate the center Y position
            yPosition = centerY - 50; // Adjust this value to move it up or down as needed

            doc.text("TO WHOM IT MAY CONCERN:", rightColumnX + headingIndent, yPosition);
            yPosition += 15; // Move down after the heading

            // Define the content text with dynamic data
            const contentText = `This is to certify to the fact that ${request.name}, ${request.age} years old, ${request.civilStatus}, Filipino citizen, is a resident of San Pascual.

This further certifies that ${request.name.split(' ').pop()} family is known with good standing yet indigent. No one in the family has regular source of income to fully support their financial needs. 

Issued on this ${new Date().getDate()}${getOrdinalSuffix(new Date().getDate())} day of ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()} for ${request.purpose} purposes only.`;
            // Split the text into lines that fit within the specified width
            const splitText = doc.splitTextToSize(contentText, pageWidth - rightColumnX - 30); // Further adjusted width

            // Iterate over each line and justify the text
            splitText.forEach((line) => {
                const lineX = rightColumnX + indent;
                // Justify the text by using the line width
                doc.text(line, lineX, yPosition, { align: "justify" }); // Justify each line
                yPosition += 8; // Increased line spacing to avoid overlap
            });

            // Signature
            doc.setFont("Helvetica", "bold");
            doc.text(`HON. ${barangayCaptain.name || '(VACANT)'}`, pageWidth - 40, pageHeight - 60, { align: "center" });
            doc.setFont("Helvetica", "normal");
            doc.text(barangayCaptain.position || "Barangay Captain", pageWidth - 40, pageHeight - 55, { align: "center" });

            // Note at the bottom
            doc.setFontSize(8);
            doc.text("Note: Not valid without official dry seal", pageWidth - 125, pageHeight - 10);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error adding images to PDF:', error);
            // Continue with PDF generation even if images fail to load
            doc.setFontSize(10);
            doc.text("Republic of the Philippines", pageWidth / 2, 15, { align: "center" });
            // ... rest of your existing code ...
        }
    };

    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Accepted':
                return 'bg-green-100 text-green-800';
            case 'Declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
        setShowDeclined(false);
        setSelectedYear(null);
        setHistorySearchTerm("");
    };

    const toggleDeclined = () => {
        setShowDeclined(!showDeclined);
        setShowHistory(false);
        setArchiveYear(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };
    const toggleArchive = () => {
        setShowDeclined(!showDeclined);
    };

    const handleRestore = (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can restore requests");
            return;
        }
        setSelectedRequest(request);
        setConfirmAction('restore');
        setShowConfirmModal(true);
    };
    // Add these computed values
    const filteredHistoryRecords = resolvedRequests.filter(request => {
        if (selectedYear) {
            return new Date(request.requestDate).getFullYear() === selectedYear;
        }
        return true;
    });

    const handlePrintOfIndigencyHistory = () => {
        // Filter indigency requests whose status is "Accepted"
        const acceptedRequests = resolvedRequests.filter(request => request.status === 'Accepted');

        // Check if there are any requests to print
        if (acceptedRequests.length === 0) {
            alert('No accepted indigency requests found.');
            return; // Exit if no rows to print
        }

        // Group requests by year
        const requestsByYear = acceptedRequests.reduce((acc, request) => {
            const year = new Date(request.requestDate).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(request);
            return acc;
        }, {});

        // Create the print content with formatted IDs
        const printContent = Object.entries(requestsByYear).flatMap(([year, requests]) => {
            return requests.map((request, index) => {
                const formattedId = `REQ-${year}-${index + 1}`; // Format the ID
                return `
                    <tr>
                        <td>${formattedId}</td>
                        <td>${request.name}</td>
                        <td>${request.age}</td>
                        <td>${request.civilStatus}</td>
                        <td>${request.certificateType}</td>
                        <td>${request.purpose}</td>
                        <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                    </tr>
                `;
            });
        }).join('');

        const newWindow = window.open('', '', 'width=800,height=600'); // Open a new window
        newWindow.document.write(`
          <html>
            <head>
              <title>Print Indigency Requests</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h2 {
                  text-align: center;
                }
                .date {
                  text-align: center;
                  font-size: 14px;
                  margin-bottom: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th,
                td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: center;
                }
                th {
                  background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #555;
                }
              </style>
            </head>
            <body>
              <div class="date">${new Date().toLocaleDateString()}</div>
              <h2>Accepted Indigency Requests</h2>
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Civil Status</th>
                    <th>Certificate Type</th>
                    <th>Purpose</th>
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${printContent}
                </tbody>
              </table>
              <footer>
                Printed on ${new Date().toLocaleDateString()}
              </footer>
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.print(); // Trigger the print dialog
    };

    const handlePrintOfArchivedDeclinedRequests = () => {
        // Filter archived declined requests
        const archivedDeclinedRequests = filteredArchiveRecords; // Assuming these are all declined

        // Check if there are any requests to print
        if (archivedDeclinedRequests.length === 0) {
            alert('No archived declined requests found.');
            return; // Exit if no rows to print
        }

        // Create the print content with formatted IDs
        const printContent = archivedDeclinedRequests.map((request, index) => {
            const formattedId = `REQ-${new Date(request.requestDate).getFullYear()}-${index + 1}`; // Format the ID
            return `
                <tr>
                    <td>${formattedId}</td>
                    <td>${request.name}</td>
                    <td>${request.age}</td>
                    <td>${request.civilStatus}</td>
                    <td>${request.certificateType}</td>
                    <td>${request.purpose}</td>
                    <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');

        const newWindow = window.open('', '', 'width=800,height=600'); // Open a new window
        newWindow.document.write(`
          <html>
            <head>
              <title>Print Archived Declined Requests</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h2 {
                  text-align: center;
                }
                .date {
                  text-align: center;
                  font-size: 14px;
                  margin-bottom: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th,
                td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: center;
                }
                th {
                  background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #555;
                }
              </style>
            </head>
            <body>
              <div class="date">${new Date().toLocaleDateString()}</div>
              <h2>Archived Declined Requests</h2>
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Civil Status</th>
                    <th>Certificate Type</th>
                    <th>Purpose</th>
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${printContent}
                </tbody>
              </table>
              <footer>
                Printed on ${new Date().toLocaleDateString()}
              </footer>
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.print(); // Trigger the print dialog
    };

    // Add these functions for editing requests
    const handleEditRequest = async (request) => {
        if (user.role !== 'admin') {
            toast.error("Only admins can edit requests");
            return;
        }

        try {
            const docRef = doc(db, 'documentRequests', request.id);
            
            await updateDoc(docRef, {
                name: requestData.name,
                age: requestData.age,
                civilStatus: requestData.civilStatus,
                purpose: requestData.purpose,
                updatedAt: serverTimestamp(),
                // Preserve resident information
                residentName: request.residentName,
                residentEmail: request.residentEmail,
                residentPhone: request.residentPhone,
                residentAddress: request.residentAddress,
                userId: request.userId
            });

            toast.success("Request updated successfully!");
            setIsEditMode(false);
            setFormVisible(false);
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error(`Failed to update request: ${error.message}`);
        }
    };

    // Add this function to load request data for editing
    const handleEditClick = (request) => {
        setRequestData({
            id: request.id,
            name: request.name,
            age: request.age,
            civilStatus: request.civilStatus,
            purpose: request.purpose,
            certificateType: request.certificateType,
            status: request.status,
            barangayId: request.barangayId,
            // Preserve other fields
            residentName: request.residentName,
            residentEmail: request.residentEmail,
            residentPhone: request.residentPhone,
            residentAddress: request.residentAddress,
            userId: request.userId
        });
        setIsEditMode(true);
        setFormVisible(true);
    };

    return (
        <motion.div 
            className='bg-white bg-opacity-50 rounded-xl p-4 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex justify-between items-center p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[#1679AB]" size={18} />
                    <input
                        type="text"
                        placeholder="Search Here..."
                        className="bg-white text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                </div>
                <div className="flex space-x-3">
                    <button 
                        className="flex items-center bg-[#1679AB] text-white rounded-full px-6 py-2"
                        onClick={() => {
                            resetForm();
                            setFormVisible(true);
                        }}
                    >
                        <FilePlus className="mr-3" size={20}/>
                        Walk-in Request
                    </button>
                    <button 
                        className="flex items-center bg-[#1679AB] text-white rounded-full px-4 py-2"
                        onClick={toggleHistory}
                    >
                        <History className="mr-2" size={20} />
                        History {resolvedRequests.length > 0 && `(${resolvedRequests.length})`}
                    </button>
                    <button 
                        className="flex items-center bg-[#1679AB] text-white rounded-full px-4 py-2"
                        onClick={toggleArchive}
                    >
                        <Archive className="mr-2" size={20} />
                        Archived {declinedRequests.length > 0 && `(${declinedRequests.length})`}
                    </button>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                {/* Table Container with fixed header */}
                <div className="relative">
                    {/* Fixed Header */}
                    <table className='min-w-full table-fixed divide-y divide-gray-200'>
                        <thead className='bg-white sticky top-0 z-10 shadow-sm'>
                            <tr>
                                <th className='w-[10%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>ID</th>
                                <th className='w-[12%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Name</th>
                                <th className='w-[8%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Age</th>
                                <th className='w-[10%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Civil Status</th>
                                <th className='w-[15%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Certificate Type</th>
                                <th className='w-[12%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Request Date</th>
                                <th className='w-[15%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Purpose</th>
                                <th className='w-[8%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Status</th>
                                <th className='w-[10%] px-2 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Action</th>
                            </tr>
                        </thead>
                    </table>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto max-h-[600px]">
                        <table className='min-w-full table-fixed divide-y divide-gray-200'>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {filteredRequest.map((request, index) => (
                                    <motion.tr 
                                        key={request.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className='w-[10%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {`REQ-${new Date(request.requestDate).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                        </td>
                                        <td className='w-[12%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{request.name}</td>
                                        <td className='w-[8%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{request.age}</td>
                                        <td className='w-[10%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{request.civilStatus}</td>
                                        <td className='w-[15%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{request.certificateType}</td>
                                        <td className='w-[12%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{formatDate(request.requestDate)}</td>
                                        <td className='w-[15%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>{request.purpose}</td>
                                        <td className='w-[8%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className='w-[10%] px-2 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            <div className='flex justify-center space-x-3'>
                                                {user.role === 'admin' && (
                                                    <>
                                                        {request.status === 'Pending' && (
                                                            <>
                                                                <Check
                                                                    className='cursor-pointer text-green-500 hover:text-green-600 transition-colors'
                                                                    size={20}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleStatusChange(request);
                                                                    }}
                                                                    title="Process Request"
                                                                />
                                                                <XCircle
                                                                    className='cursor-pointer text-red-500 hover:text-red-600 transition-colors'
                                                                    size={20}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDecline(request);
                                                                    }}
                                                                    title="Decline Request"
                                                                />
                                                                <Edit
                                                                    className='cursor-pointer text-[#1679AB] hover:text-[#136290] transition-colors'
                                                                    size={20}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleEdit(request);
                                                                    }}
                                                                    title="Edit Request"
                                                                />
                                                            </>
                                                        )}
                                                        {request.status === 'Processing' && (
                                                            <Printer
                                                                className='cursor-pointer text-[#1679AB] hover:text-[#136290] transition-colors'
                                                                size={20}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handlePrintAndAccept(request);
                                                                }}
                                                                title="Print and Accept Request"
                                                            />
                                                        )}
                                                        {request.status === 'Accepted' && (
                                                            <Printer
                                                                className='cursor-pointer text-[#1679AB] hover:text-[#136290] transition-colors'
                                                                size={20}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleGeneratePdf(request);
                                                                }}
                                                                title="Print Certificate"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

             {/* Form Modal */}
{formVisible && (
    <motion.div
        className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header - Fixed at top */}
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center">
                    <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
                        <FilePlus className="text-[#1679AB]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[#1679AB]">
                            {isEditMode ? 'Edit Request' : 'Walk-In Request'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Fill in the information below to {isEditMode ? 'update' : 'submit'} a request
                        </p>
                    </div>
                    <button 
                        onClick={resetForm}
                        className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 pb-24">
                <form id="requestForm" onSubmit={isEditMode ? handleUpdateRequest : handleSubmitRequest} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Resident's Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={requestData.name} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Age
                                </label>
                                <input 
                                    type="number" 
                                    name="age" 
                                    value={requestData.age} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    placeholder="Enter age"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Civil Status
                                </label>
                                <select 
                                    name="civilStatus" 
                                    value={requestData.civilStatus} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Civil Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Details Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Certificate Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Certificate Type
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium">
                                    Certificate of Indigency
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Purpose
                                </label>
                                <input 
                                    type="text" 
                                    name="purpose" 
                                    value={requestData.purpose} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    placeholder="Enter purpose"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Date Requested
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                    {new Date().toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-b-2xl">
                <div className="flex justify-end space-x-4">
                    <button 
                        type="button" 
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="requestForm"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#1679ab] rounded-lg hover:bg-[#136290] transition-colors"
                    >
                        {isEditMode ? 'Update Request' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
)}

             {/* PDF Viewer Modal */}
             <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="PDF Preview"
                style={{
                    content: {
                        border: '1px solid #ccc',
                        borderRadius: '10px',
                        padding: '25px',
                        maxWidth: '80%',
                        maxHeight: '100%',
                        margin: 'auto',
                        overflow: 'hidden',
                        zIndex: 1000,
                        marginBottom: '20px',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        zIndex: 999, // Ensure the overlay is on top
                    },
                }}
            >
                <div style={{ textAlign: 'right' }}>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '10px', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '18px' // Adjust size as needed
                        }}
                        aria-label="Close"
                    >
                        <X size={20} /> {/* Use the X icon */}
                    </button>
                </div>
                <iframe src={pdfUrl} width="100%" height="100%" title="PDF Preview" style={{ border: 'none' }}></iframe>
            </Modal>
            <ConfirmationModal />
            {/* History Section */}
            {showHistory && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            {/* Fixed Header */}
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <div className="flex items-center">
                                    <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
                                        <History className="text-[#1679AB]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl italic font-semibold text-[#1679AB]">Request History</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {resolvedRequests.length} completed {resolvedRequests.length === 1 ? 'request' : 'requests'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search in history..."
                                                className="w-full bg-gray-50 text-gray-600 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus-red-500"
                                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={toggleHistory}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Year Filter Tabs */}
                            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                                {Array.from(new Set(resolvedRequests.map(request => 
                                    new Date(request.requestDate).getFullYear()
                                ))).sort((a, b) => b - a).map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                            ${selectedYear === year 
                                                ? 'bg-[#1679AB] text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setSelectedYear(null)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                        ${!selectedYear 
                                            ? 'bg-[#1679AB] text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All Years
                                </button>
                                <button
                                    onClick={handlePrintOfIndigencyHistory}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#1679AB] text-white hover:bg-[#136290] transition-colors"
                                >
                                    <Printer size={16} className="inline-block mr-1" />
                                    Print
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
                                {filteredHistoryRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredHistoryRecords.map((request, index) => (
                                            <motion.div
                                                key={request.id}
                                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <span className="bg-[#1679AB] text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                {`REQ-${new Date(request.requestDate).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                Filed: {new Date(request.requestDate).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-sm text-gray-500 mb-1">Residents Name</p>
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                    {request.name}
                                                                </h4>
                                                                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                                                                    <span>{request.age} years old</span>
                                                                    <span>•</span>
                                                                    <span>{request.civilStatus}</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-sm text-gray-500 mb-1">Certificate Details</p>
                                                                <h4 className="text-lg font-semibold text-[#1679ab]">
                                                                    {request.certificateType}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Purpose: {request.purpose}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Term Status Display */}
                                                        <div className="mt-2">
                                                            <span className="text-sm font-medium">Status of Requesting: </span>
                                                            <span className={`text-sm ${request.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right side - Actions */}
                                                    <div className="ml-6">
                                                        <Printer
                                                            className='cursor-pointer text-[#1679AB] hover:text-[#136290] transition-colors'
                                                            size={20}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleGeneratePdf(request);
                                                            }}
                                                            title="Print Certificate"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-xl">
                                        <History size={48} className="text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No completed requests found</p>
                                        <p className="text-sm text-gray-400">All completed requests will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Archived/Declined Requests Section */}
            {showDeclined && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            {/* Fixed Header */}
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <div className="flex items-center">
                                    <div className="bg-red-500 bg-opacity-10 p-3 rounded-xl mr-4">
                                        <Archive className="text-red-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl italic font-semibold text-red-500">Archived Requests</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {declinedRequests.length} archived {declinedRequests.length === 1 ? 'request' : 'requests'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search in archive..."
                                                className="w-full bg-gray-50 text-gray-600 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus-red-500"
                                                onChange={(e) => setArchiveSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={toggleDeclined}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Year Filter Tabs */}
                            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                                {Array.from(new Set(declinedRequests.map(request => 
                                    new Date(request.requestDate).getFullYear()
                                ))).sort((a, b) => b - a).map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setArchiveYear(year)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                            ${archiveYear === year 
                                                ? 'bg-red-500 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setArchiveYear(null)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                        ${!archiveYear 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All Years
                                </button>
                                <button
                                    onClick={handlePrintOfArchivedDeclinedRequests}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    <Printer size={16} className="inline-block mr-1" />
                                    Print
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
                                {filteredArchiveRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredArchiveRecords.map((request, index) => (
                                            <motion.div
                                                key={request.id}
                                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                {`REQ-${new Date(request.requestDate).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                Filed: {formatDate(request.requestDate)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-sm text-gray-500 mb-1">Residents Name</p>
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                    {request.name}
                                                                </h4>
                                                                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                                                                    <span>{request.age} years old</span>
                                                                    <span>•</span>
                                                                    <span>{request.civilStatus}</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-sm text-gray-500 mb-1">Certificate Details</p>
                                                                <h4 className="text-lg font-semibold text-red-500">
                                                                    {request.certificateType}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Purpose: {request.purpose}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Term Status Display */}
                                                        <div className="mt-2">
                                                            <span className="text-sm font-medium">Status of Requesting: </span>
                                                            <span className="text-sm text-red-500">
                                                                Declined
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-xl">
                                        <Archive size={48} className="text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No archived requests found</p>
                                        <p className="text-sm text-gray-400">All archived requests will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default IndigencyTable;