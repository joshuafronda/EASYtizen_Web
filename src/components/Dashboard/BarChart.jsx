import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const COLORS = {
	default: ["#1679AB", "#2E96C7", "#45B3E3", "#5CCFFF", "#73ECFF"],
	hover: ["#135C8A", "#2579A6", "#3796C2", "#49B3DE", "#5BD0FA"]
};

const CERTIFICATE_TYPES = [
	{ name: "Barangay Clearance", value: 0, previousValue: 0 },
	{ name: "Certificate of Indigency", value: 0, previousValue: 0 },
	{ name: "Certificate of Residency", value: 0, previousValue: 0 },
	{ name: "Blotter Record", value: 0, previousValue: 0 }
];

const BarCharts = ({ user }) => {
	const [requestData, setRequestData] = useState(CERTIFICATE_TYPES);
	const [activeIndex, setActiveIndex] = useState(null);

	useEffect(() => {
		const fetchRequestData = async () => {
			try {
				// Get document requests count (from both collections)
				const documentRequestsQuery = query(
					collection(db, 'documentRequests'),
					where('barangayId', '==', user.barangayId)
				);

				const residencyRequestsQuery = query(
					collection(db, 'residencyRequests'),
					where('barangayId', '==', user.barangayId)
				);

				const blotterQuery = query(
					collection(db, 'blotterRecords'),
					where('barangayId', '==', user.barangayId)
				);

				// Fetch all data in parallel
				const [
					documentRequestsSnapshot, 
					residencyRequestsSnapshot,
					blotterSnapshot
				] = await Promise.all([
					getDocs(documentRequestsQuery),
					getDocs(residencyRequestsQuery),
					getDocs(blotterQuery)
				]);

				// Initialize certificate type counts
				const typeCounts = CERTIFICATE_TYPES.map(type => ({
					...type,
					value: 0,
					previousValue: 0
				}));

				// Process document requests
				documentRequestsSnapshot.forEach((doc) => {
					const data = doc.data();
					if (data.certificateType) {
						const typeIndex = typeCounts.findIndex(t => t.name === data.certificateType);
						if (typeIndex !== -1) {
							typeCounts[typeIndex].value++;
						}
					}
				});

				// Process residency requests
				residencyRequestsSnapshot.forEach((doc) => {
					const data = doc.data();
					if (data.certificateType) {
						const typeIndex = typeCounts.findIndex(t => t.name === data.certificateType);
						if (typeIndex !== -1) {
							typeCounts[typeIndex].value++;
						}
					}
				});

				// Process blotter records
				blotterSnapshot.forEach(() => {
					const blotterIndex = typeCounts.findIndex(t => t.name === "Blotter Record");
					if (blotterIndex !== -1) {
						typeCounts[blotterIndex].value++;
					}
				});

				setRequestData(typeCounts);
			} catch (error) {
				console.error('Error fetching request data:', error);
			}
		};

		if (user?.barangayId) {
			fetchRequestData();
		}
	}, [user]);

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const currentValue = payload[0].value;
			const previousValue = payload[0].payload.previousValue;
			const growth = previousValue ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 'N/A';
			
			return (
				<div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
					<p className="font-semibold text-gray-800">{label}</p>
					<p className="text-[#1679AB]">{`Current Week: ${currentValue} requests`}</p>
					<p className="text-gray-600">{`Previous Week: ${previousValue} requests`}</p>
					<p className={`font-medium ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
						{`Growth: ${growth}%`}
					</p>
				</div>
			);
		}
		return null;
	};

	const CustomLegend = () => (
		<div className="flex flex-wrap gap-4 justify-center mt-4">
			{requestData.map((entry, index) => (
				<div 
					key={`legend-${index}`}
					className="flex items-center gap-2 cursor-pointer"
					onMouseEnter={() => setActiveIndex(index)}
					onMouseLeave={() => setActiveIndex(null)}
				>
					<div 
						className="w-3 h-3 rounded-sm"
						style={{ 
							backgroundColor: activeIndex === index 
								? COLORS.hover[index] 
								: COLORS.default[index] 
						}}
					/>
					<span className="text-sm text-gray-600 hover:text-gray-900">
						{entry.name} ({entry.value})
					</span>
				</div>
			))}
		</div>
	);

	return (
		<motion.div
			className="bg-white p-3 rounded-lg shadow-md"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-800">
						Document Distribution
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						By Certificate Type
					</p>
				</div>
				<div className="text-sm text-gray-500">
					Total Requests: {requestData.reduce((acc, curr) => acc + curr.value, 0)}
				</div>
			</div>

			<div className="h-80">
				<ResponsiveContainer>
					<BarChart 
						data={requestData}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
						<XAxis 
							dataKey="name" 
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }}
						/>
						<YAxis 
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }}
							tickFormatter={(value) => `${value}`}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Bar 
							dataKey="value"
							radius={[4, 4, 0, 0]}
							onMouseEnter={(_, index) => setActiveIndex(index)}
							onMouseLeave={() => setActiveIndex(null)}
						>
							{requestData.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={activeIndex === index ? COLORS.hover[index] : COLORS.default[index]}
									cursor="pointer"
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<CustomLegend />
		</motion.div>
	);
};

export default BarCharts;
