import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const CERTIFICATE_TYPES = {
	"All Requests": "#1679AB",
	"Barangay Clearance": "#2E96C7",
	"Certificate of Indigency": "#45B3E3",
	"Certificate of Residency": "#73ECFF"
};

const PopulationChart = () => {
	const [requestData, setRequestData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedType, setSelectedType] = useState("All Requests");

	useEffect(() => {
		const fetchRequestData = async () => {
			try {
				const now = new Date();
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				
				// Initialize daily data structure with all certificate types
				const dailyData = {};
				for (let d = 1; d <= endOfMonth.getDate(); d++) {
					dailyData[d] = {
						day: d,
						"All Requests": 0,
						"Barangay Clearance": 0,
						"Certificate of Indigency": 0,
						"Certificate of Residency": 0
					};
				}

				// Fetch document requests
				const documentSnapshot = await getDocs(collection(db, 'documentRequests'));
				documentSnapshot.forEach((doc) => {
					const data = doc.data();
					const date = data.createdAt?.toDate() || new Date(data.requestDate);
					
					if (date >= startOfMonth && date <= endOfMonth) {
						const day = date.getDate();
						if (data.certificateType === "Barangay Clearance" || 
							data.certificateType === "Certificate of Indigency") {
							dailyData[day][data.certificateType]++;
							dailyData[day]["All Requests"]++;
						}
					}
				});

				// Fetch residency requests
				const residencySnapshot = await getDocs(collection(db, 'residencyRequests'));
				residencySnapshot.forEach((doc) => {
					const data = doc.data();
					const date = data.createdAt?.toDate() || new Date(data.requestDate);
					
					if (date >= startOfMonth && date <= endOfMonth) {
						const day = date.getDate();
						dailyData[day]["Certificate of Residency"]++;
						dailyData[day]["All Requests"]++;
					}
				});

				setRequestData(Object.values(dailyData));
				setLoading(false);
			} catch (err) {
				console.error("Error fetching request data:", err);
				setError("Failed to load request data");
				setLoading(false);
			}
		};

		fetchRequestData();
	}, []);

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 rounded-lg shadow-md">
					<p className="font-medium text-gray-800">{`Day ${label}`}</p>
					<p className="text-[#1679AB]">
						{selectedType}: {data[selectedType]}
					</p>
				</div>
			);
		}
		return null;
	};

	if (loading) return <div className="loading-spinner" />;
	if (error) return <div className="error-message">{error}</div>;

	const totalRequests = requestData.reduce((acc, curr) => acc + curr[selectedType], 0);
	const maxRequests = Math.max(...requestData.map(d => d[selectedType]));

	return (
		<motion.div className="bg-white rounded-xl p-6 shadow-md">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-800">
						Daily Request Trends
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
					</p>
				</div>
				{/* Certificate Type Filter */}
				<select
					value={selectedType}
					onChange={(e) => setSelectedType(e.target.value)}
					className="px-3 py-2 border rounded-lg text-gray-700 text-sm focus:outline-none focus:border-[#1679AB]"
				>
					{Object.keys(CERTIFICATE_TYPES).map(type => (
						<option key={type} value={type}>{type}</option>
					))}
				</select>
			</div>

			<div className="h-80">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={requestData}
						margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
						<XAxis
							dataKey="day"
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }}
						>
							<Label value="Day of the Month" offset={-2} position="insideBottom" />
						</XAxis>
						<YAxis
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }}
						>
							<Label value="Number of Requests" angle={-90} position="insideLeft" offset={-5} />
						</YAxis>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey={selectedType}
							stroke={CERTIFICATE_TYPES[selectedType]}
							strokeWidth={3}
							dot={{
								fill: "#ffffff",
								stroke: CERTIFICATE_TYPES[selectedType],
								strokeWidth: 2,
								r: 4,
							}}
							activeDot={{
								r: 8,
								stroke: CERTIFICATE_TYPES[selectedType],
								strokeWidth: 2,
								fill: "#ffffff"
							}}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Summary Statistics */}
			<div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50/30 rounded-lg">
				<div>
					<p className="text-sm text-gray-500">Total {selectedType}</p>
					<p className="text-lg font-semibold" style={{ color: CERTIFICATE_TYPES[selectedType] }}>
						{totalRequests}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500">Daily Average</p>
					<p className="text-lg font-semibold" style={{ color: CERTIFICATE_TYPES[selectedType] }}>
						{(totalRequests / requestData.length).toFixed(1)}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500">Peak Requests</p>
					<p className="text-lg font-semibold" style={{ color: CERTIFICATE_TYPES[selectedType] }}>
						{maxRequests}
					</p>
				</div>
			</div>
		</motion.div>
	);
};

export default PopulationChart;
