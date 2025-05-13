import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const COLORS = {
	"Barangay Clearance": "#1679AB",
	"Certificate of Indigency": "#45B3E3",
	"Certificate of Residency": "#73ECFF"
};

const RequestChart = () => {
	const [requestData, setRequestData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRequests = async () => {
			try {
				// Updated barangay list
				const barangayCounts = {
					"Alalum": { name: "Alalum" },
					"Antipolo": { name: "Antipolo" },
					"Balimbing": { name: "Balimbing" },
					"Banaba": { name: "Banaba" },
					"Bayanan": { name: "Bayanan" },
					"Danglayan": { name: "Danglayan" },
					"Del Pilar": { name: "Del Pilar" },
					"Gelerang Kawayan": { name: "Gelerang Kawayan" },
					"Ilat North": { name: "Ilat North" },
					"Ilat South": { name: "Ilat South" },
					"Kaingin": { name: "Kaingin" },
					"Laurel": { name: "Laurel" },
					"Malaking Pook": { name: "Malaking Pook" },
					"Mataas na Lupa": { name: "Mataas na Lupa" },
					"Natunuan North": { name: "Natunuan North" },
					"Natunuan South": { name: "Natunuan South" },
					"Padre Castillo": { name: "Padre Castillo" },
					"Palsahingin": { name: "Palsahingin" },
					"Pila": { name: "Pila" },
					"Poblacion": { name: "Poblacion" },
					"Pook ni Banal": { name: "Pook ni Banal" },
					"Pook ni Kapitan": { name: "Pook ni Kapitan" },
					"Resplandor": { name: "Resplandor" },
					"Sambat": { name: "Sambat" },
					"San Antonio": { name: "San Antonio" },
					"San Mariano": { name: "San Mariano" },
					"San Mateo": { name: "San Mateo" },
					"Santa Elena": { name: "Santa Elena" },
					"Santo Niño": { name: "Santo Niño" }
				};

				// Initialize certificate type counts for each barangay
				Object.keys(barangayCounts).forEach(barangay => {
					barangayCounts[barangay]["Barangay Clearance"] = 0;
					barangayCounts[barangay]["Certificate of Indigency"] = 0;
					barangayCounts[barangay]["Certificate of Residency"] = 0;
				});

				// Fetch and count document requests
				const documentSnapshot = await getDocs(collection(db, 'documentRequests'));
				documentSnapshot.forEach((doc) => {
					const data = doc.data();
					if (data.barangayId && data.certificateType && barangayCounts[data.barangayId]) {
						if (data.certificateType === "Barangay Clearance" || 
							data.certificateType === "Certificate of Indigency") {
							barangayCounts[data.barangayId][data.certificateType]++;
						}
					}
				});

				// Fetch and count residency requests
				const residencySnapshot = await getDocs(collection(db, 'residencyRequests'));
				residencySnapshot.forEach((doc) => {
					const data = doc.data();
					if (data.barangayId && barangayCounts[data.barangayId]) {
						barangayCounts[data.barangayId]["Certificate of Residency"]++;
					}
				});

				// Convert to array format for the chart
				const formattedData = Object.values(barangayCounts).map(barangay => ({
					name: barangay.name,
					"Barangay Clearance": barangay["Barangay Clearance"],
					"Certificate of Indigency": barangay["Certificate of Indigency"],
					"Certificate of Residency": barangay["Certificate of Residency"],
					total: barangay["Barangay Clearance"] + 
						 barangay["Certificate of Indigency"] + 
						 barangay["Certificate of Residency"]
				}));

				// Sort by total requests
				formattedData.sort((a, b) => b.total - a.total);
				setRequestData(formattedData);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching requests:', error);
				setLoading(false);
			}
		};

		fetchRequests();
	}, []);

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
					<p className="font-semibold text-gray-800">{`Barangay ${label}`}</p>
					{payload.map((entry, index) => (
						<p key={index} style={{ color: entry.color }} className="text-sm">
							{`${entry.name}: ${entry.value}`}
						</p>
					))}
					<p className="text-[#1679AB] font-medium mt-2">
						{`Total: ${payload[0].payload.total}`}
					</p>
				</div>
			);
		}
		return null;
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<motion.div
			className="bg-white rounded-xl p-6 lg:col-span-2 border border-gray-200 shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-800">
						Certificate Requests by Barangay
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						Distribution of certificate types per barangay
					</p>
				</div>
			</div>

			<div className="h-80">
				<ResponsiveContainer>
					<BarChart 
						data={requestData}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis 
							dataKey="name" 
							fontSize={12}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<Bar dataKey="Barangay Clearance" stackId="a" fill={COLORS["Barangay Clearance"]} />
						<Bar dataKey="Certificate of Indigency" stackId="a" fill={COLORS["Certificate of Indigency"]} />
						<Bar dataKey="Certificate of Residency" stackId="a" fill={COLORS["Certificate of Residency"]} />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Summary Statistics */}
			<div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50/30 rounded-lg">
				<div>
					<p className="text-sm text-gray-500">Total Requests</p>
					<p className="text-lg font-semibold text-[#1679AB]">
						{requestData.reduce((acc, curr) => acc + curr.total, 0)}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500">Most Active Barangay</p>
					<p className="text-lg font-semibold text-[#1679AB]">
						{requestData[0]?.name}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500">Most Requested Type</p>
					<p className="text-lg font-semibold text-[#1679AB]">
						{Object.keys(COLORS).reduce((a, b) => 
							requestData.reduce((sum, curr) => sum + curr[a], 0) > 
							requestData.reduce((sum, curr) => sum + curr[b], 0) ? a : b
						)}
					</p>
				</div>
			</div>
		</motion.div>
	);
};

export default RequestChart;
