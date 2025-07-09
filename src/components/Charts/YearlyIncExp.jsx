import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { userAuth } from '../../context/AuthContext'
import { fetchTransactions } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

// register the Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend
)

const YearlyIncExp = () => {
    const [selectedYear, setSelectedYear] = useState('2025')
    const [selectedType, setSelectedType] = useState('Income')
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const chartRef = useRef(null)
    const chartInstance = useRef(null)

    const { session } = userAuth()

    const typeOptions = ['Income', 'Expenditure']

    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 76 }, (_, i) =>
        String(currentYear + i)
    )

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // color palette for the cats 
    const colorPalette = [
        '#4F46E5', '#7C3AED', '#DC2626', '#EA580C', '#D97706', '#CA8A04',
        '#65A30D', '#16A34A', '#059669', '#0891B2', '#0284C7', '#2563EB',
        '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#EF4444', '#F97316',
        '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6',

        '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA', '#D946EF',
        '#DB2777', '#E11D48', '#F43F5E', '#FB7185', '#F87171', '#FB923C',
        '#FACC15', '#A3E635', '#4ADE80', '#2DD4BF', '#06B6D4', '#60A5FA',
        '#818CF8', '#C084FC', '#E879F9', '#F472B6', '#F87171', '#FBBF24'
    ];


    useEffect(() => {
        if (session?.user?.id) {
            loadData()
        }
    }, [session?.user?.id, selectedYear, selectedType])



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isYearDropdownOpen && !event.target.closest('.year-dropdown')) {
                setIsYearDropdownOpen(false)
            }
            if (isTypeDropdownOpen && !event.target.closest('.type-dropdown')) {
                setIsTypeDropdownOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isYearDropdownOpen, isTypeDropdownOpen])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            const transactionResult = await fetchTransactions(session.user.id)

            if (transactionResult.success) {
                processChartData(transactionResult.data || [])
            } else {
                setError(transactionResult.error)
                console.error('Failed to load data:', transactionResult.error)
            }
        } catch (err) {
            setError('Failed to load data')
            console.error('Error loading data:', err)
        } finally {
            setLoading(false)
        }
    }

    const processChartData = (transactions) => {
        // filter transactions by year 
        const filteredTransactions = transactions.filter(transaction => {
            const transactionYear = new Date(transaction.date).getFullYear().toString()
            return transactionYear === selectedYear &&
                (selectedType === 'Income' ? transaction.type === 'Income' : transaction.type !== 'Income')
        })

        // group transactions by month and category
        const monthlyData = {}
        const categories = new Set()

        filteredTransactions.forEach(transaction => {
            const month = new Date(transaction.date).getMonth()
            const category = transaction.category

            if (!monthlyData[month]) {
                monthlyData[month] = {}
            }

            if (!monthlyData[month][category]) {
                monthlyData[month][category] = 0
            }

            monthlyData[month][category] += transaction.amount
            categories.add(category)
        })

        // convert to chart format
        const categoriesArray = Array.from(categories).sort()
        const datasets = categoriesArray.map((category, index) => ({
            label: category,
            data: monthNames.map((_, monthIndex) =>
                monthlyData[monthIndex]?.[category] || 0
            ),
            backgroundColor: colorPalette[index % colorPalette.length],
            borderColor: colorPalette[index % colorPalette.length],
            borderWidth: 1
        }))

        setChartData({
            labels: monthNames,
            datasets
        })
    }

    // create/update chart
    useEffect(() => {
        if (chartData.labels && chartRef.current && !loading) {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }

            const ctx = chartRef.current.getContext('2d')

            chartInstance.current = new ChartJS(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${selectedType} by Month - ${selectedYear}`,
                            color: '#f8f9fa',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'center',
                            labels: {
                                color: '#f8f9fa',
                                font: {
                                    size: 12
                                },
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                color: '#333',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#f8f9fa',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            stacked: true,
                            grid: {
                                color: '#333',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#f8f9fa',
                                font: {
                                    size: 11
                                },
                                callback: function (value) {
                                    return new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'AED',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(value)
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    }
                }
            })
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [chartData, loading, selectedType, selectedYear])

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getTotalAmount = () => {
        if (!chartData.datasets) return 0
        return chartData.datasets.reduce((total, dataset) => {
            return total + dataset.data.reduce((sum, value) => sum + value, 0)
        }, 0)
    }

    if (loading) {
        return <LoadingAnimation message={`Loading ${selectedType.toLowerCase()} data...`} />
    }

    return (
        <div className="w-full max-w-8xl mx-auto py-4 sm:px-5 sm:py-0">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-300 hover:text-red-100 text-xs underline mt-1"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-t-2xl px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#f8f9fa] mb-2">
                            Yearly {selectedType}
                        </h1>
                    </div>

                    <div className="flex gap-2">
                        {/* Type Dropdown */}
                        <div className="relative type-dropdown">
                            <button
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="flex items-center justify-between gap-3 px-4 py-2 bg-[#242424] border border-[#666] rounded-lg text-[#f8f9fa] hover:bg-[#343434] transition-colors duration-200 text-sm sm:text-base font-medium min-w-[130px]"
                            >
                                <span>{selectedType}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isTypeDropdownOpen && (
                                <div className="absolute top-full mt-1 right-0 w-full bg-[#282828] border border-[#333] rounded-lg shadow-lg z-20 animate-slideDown">
                                    {typeOptions.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type)
                                                setIsTypeDropdownOpen(false)
                                            }}
                                            className={`w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${selectedType === type ? 'bg-[#333]' : ''
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Year Dropdown */}
                        <div className="relative year-dropdown">
                            <button
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                className="flex items-center justify-between gap-3 px-4 py-2 bg-[#242424] border border-[#666] rounded-lg text-[#f8f9fa] hover:bg-[#343434] transition-colors duration-200 text-sm sm:text-base font-medium min-w-[100px]"
                            >
                                <span>{selectedYear}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isYearDropdownOpen && (
                                <div className="absolute top-full mt-1 right-0 w-full bg-[#282828] border border-[#333] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto animate-slideDown">
                                    {yearOptions.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setSelectedYear(year)
                                                setIsYearDropdownOpen(false)
                                            }}
                                            className={`w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${selectedYear === year ? 'bg-[#333]' : ''
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-[#202020] border-x border-[#333] p-6">
                <div className="h-[400px] w-full">
                    {chartData.labels && chartData.datasets && chartData.datasets.length > 0 ? (
                        <canvas ref={chartRef} className="w-full h-full"></canvas>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#f8f9fa]">
                            <div className="text-center">
                                <div className="text-lg mb-2">No {selectedType.toLowerCase()} data found for {selectedYear}</div>
                                <div className="text-sm">Add transactions to see the chart</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-b-2xl p-6 border-t-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-sm text-[#f8f9fa] mb-1">Total {selectedType}</div>
                        <div className="text-xl font-semibold text-[#f8f9fa]">
                            {formatAmount(getTotalAmount())}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-[#f8f9fa] mb-1">Monthly Avg.</div>
                        <div className="text-xl font-semibold text-[#f8f9fa]">
                            {formatAmount(getTotalAmount() / 12)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default YearlyIncExp