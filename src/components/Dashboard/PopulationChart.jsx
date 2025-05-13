import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { TrendingUp, TrendingDown, Award, Clock, BarChart2 } from 'lucide-react';

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CERTIFICATE_TYPES = {
	"All Types": "#1679AB",
	"Barangay Clearance": "#2E96C7",
	"Certificate of Indigency": "#45B3E3",
	"Certificate of Residency": "#73ECFF"
};

const PopulationChart = ({ user }) => {
	const [selectedType, setSelectedType] = useState("All Types");
	const [requestData, setRequestData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [insights, setInsights] = useState({
		weeklyTrend: 0,
		mostRequestedDay: '',
		mostRequestedType: '',
		totalRequests: 0,
		averageDaily: 0,
		typeBreakdown: {},
		peakPerformance: {}
	});

	useEffect(() => {
		if (user?.barangayName) {
			fetchRequestData(user.barangayName);
		}
	}, [user?.barangayName]);

	const fetchRequestData = async (barangayName) => {
		try {
			const weekdayData = WEEKDAYS.reduce((acc, day) => {
				acc[day] = {
					name: day,
					"All Types": 0,
					"Barangay Clearance": 0,
					"Certificate of Indigency": 0,
					"Certificate of Residency": 0
				};
				return acc;
			}, {});

			const documentSnapshot = await getDocs(
				query(
					collection(db, 'documentRequests'),
					where('barangayName', '==', barangayName)
				)
			);

			documentSnapshot.forEach((doc) => {
				const data = doc.data();
				const date = data.createdAt?.toDate() || new Date(data.requestDate);
				const dayName = WEEKDAYS[date.getDay() - 1];

				if (dayName && data.certificateType) {
					weekdayData[dayName][data.certificateType]++;
					weekdayData[dayName]["All Types"]++;
				}
			});

			const residencySnapshot = await getDocs(
				query(
					collection(db, 'residencyRequests'),
					where('barangayName', '==', barangayName)
				)
			);

			residencySnapshot.forEach((doc) => {
				const data = doc.data();
				const date = data.createdAt?.toDate() || new Date(data.requestDate);
				const dayName = WEEKDAYS[date.getDay() - 1];

				if (dayName) {
					weekdayData[dayName]["Certificate of Residency"]++;
					weekdayData[dayName]["All Types"]++;
				}
			});

			const formattedData = Object.values(weekdayData);
			setRequestData(formattedData);
			calculateInsights(formattedData);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching request data:", error);
			setLoading(false);
		}
	};

	const calculateInsights = (data) => {
		const typeBreakdown = {
			"Barangay Clearance": 0,
			"Certificate of Indigency": 0,
			"Certificate of Residency": 0
		};

		data.forEach(day => {
			typeBreakdown["Barangay Clearance"] += day["Barangay Clearance"];
			typeBreakdown["Certificate of Indigency"] += day["Certificate of Indigency"];
			typeBreakdown["Certificate of Residency"] += day["Certificate of Residency"];
		});

		const mostRequestedType = Object.entries(typeBreakdown).reduce((max, [type, count]) => 
			count > max.count ? { type, count } : max,
			{ type: '', count: 0 }
		);

		const startOfWeek = data[0][selectedType];
		const endOfWeek = data[data.length - 1][selectedType];
		const weeklyTrend = startOfWeek !== 0 
			? ((endOfWeek - startOfWeek) / startOfWeek) * 100 
			: 0;

		const mostRequestedDay = data.reduce((max, curr) => 
			curr[selectedType] > max.value 
				? { day: curr.name, value: curr[selectedType] }
				: max,
			{ day: '', value: 0 }
		);

		const totalRequests = data.reduce((sum, curr) => sum + curr[selectedType], 0);
		const averageDaily = totalRequests / 5;

		setInsights({
			weeklyTrend,
			mostRequestedDay: mostRequestedDay.day,
			mostRequestedType: mostRequestedType.type,
			totalRequests,
			averageDaily: averageDaily.toFixed(1),
			typeBreakdown,
			peakPerformance: {
				day: mostRequestedDay.day,
				requests: mostRequestedDay.value
			}
		});
	};

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
					<p className="font-medium text-gray-800">{label}</p>
					<p className="text-[#1679AB] font-medium">
						{`${payload[0].value} requests`}
					</p>
					<p className="text-sm text-gray-500">
						{selectedType}
					</p>
				</div>
			);
		}
		return null;
	};

	if (loading) return <div className="loading-spinner" />;

	return (
		<motion.div className="bg-white rounded-xl p-6 shadow-md">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-800">
						 Request Analytics
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						Weekly request analysis and insights
					</p>
				</div>
				<select
					className="px-3 py-2 border rounded-lg text-gray-700 text-sm focus:outline-none focus:border-[#1679AB]"
					value={selectedType}
					onChange={(e) => setSelectedType(e.target.value)}
				>
					{Object.keys(CERTIFICATE_TYPES).map(type => (
						<option key={type} value={type}>{type}</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-blue-50 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-600">Weekly Performance</h3>
						{insights.weeklyTrend >= 0 ? (
							<TrendingUp className="text-green-500" size={20} />
						) : (
							<TrendingDown className="text-red-500" size={20} />
						)}
					</div>
					<p className={`text-lg font-bold ${insights.weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
						{Math.abs(insights.weeklyTrend).toFixed(1)}%
					</p>
					<p className="text-xs text-gray-500">
						{insights.weeklyTrend >= 0 ? 'Increase' : 'Decrease'} in requests
					</p>
				</div>

				<div className="bg-blue-50 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-600">Most Requested</h3>
						<Award className="text-[#1679AB]" size={20} />
					</div>
					<p className="text-lg font-bold text-[#1679AB]">
						{insights.mostRequestedType.split(' ').pop()}
					</p>
					<p className="text-xs text-gray-500">
						{insights.typeBreakdown[insights.mostRequestedType]} requests
					</p>
				</div>

				<div className="bg-blue-50 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-600">Peak Day</h3>
						<Clock className="text-[#1679AB]" size={20} />
					</div>
					<p className="text-lg font-bold text-[#1679AB]">
						{insights.peakPerformance.day}
					</p>
					<p className="text-xs text-gray-500">
						{insights.peakPerformance.requests} requests
					</p>
				</div>

				<div className="bg-blue-50 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-600">Daily Average</h3>
						<BarChart2 className="text-[#1679AB]" size={20} />
					</div>
					<p className="text-lg font-bold text-[#1679AB]">
						{insights.averageDaily}
					</p>
					<p className="text-xs text-gray-500">requests per day</p>
				</div>
			</div>

			<div className="h-80">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={requestData}
						margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
						<XAxis
							dataKey="name"
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }}
						>
							<Label value="Days of the Week" offset={-2} position="insideBottom" />
						</XAxis>
						<YAxis
							stroke="#6B7280"
							fontSize={12}
							tickLine={false}
							axisLine={{ stroke: '#E5E7EB' }
							}
						>
							<Label value="Number of Requests" angle={-90} position="insideLeft" offset={10} />
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

			<div className="mt-6 p-4 bg-gray-50 rounded-lg">
				<h3 className="text-sm font-medium text-gray-700 mb-2">
					Barangay Performance Summary
				</h3>
				<p className="text-sm text-gray-600">
					Barangay {user?.barangayName} shows a {insights.weeklyTrend >= 0 ? 'positive' : 'negative'} trend 
					with a {Math.abs(insights.weeklyTrend).toFixed(1)}% {insights.weeklyTrend >= 0 ? 'increase' : 'decrease'} in requests. 
					The most requested document is {insights.mostRequestedType} with {insights.typeBreakdown[insights.mostRequestedType]} requests. 
					Peak activity occurs on {insights.peakPerformance.day} with {insights.peakPerformance.requests} requests, 
					while maintaining a daily average of {insights.averageDaily} requests.
				</p>
			</div>
		</motion.div>
	);
};

export default PopulationChart;
