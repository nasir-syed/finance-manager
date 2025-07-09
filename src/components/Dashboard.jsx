import { useState } from 'react'
import { userAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TransactionsTable from './Transactions/TransactionsTable'
import Notes from './Notes/Notes'
import BudgetTable from './Budget/BudgetTable'
import AssetsTable from './Assets/AssetsTable'
import AlertDialog from './Utils/AlertDialog'
import OverUnderBudgetTable from './Budget/OverUnderBudgetTable'
import MonthlyExpenditureTable from './Transactions/MonthlyExpenditureTable'
import YearlyIncExp from './Charts/YearlyIncExp'

const Dashboard = () => {
    const { signOut } = userAuth()
    const navigate = useNavigate()
    const [signOutDialog, setSignOutDialog] = useState(false)
    const [activeTab, setActiveTab] = useState('home')

    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/auth')
        } catch (error) {
            console.error(error)
        }
    }

    const handleSignOutCancel = () => {
        setSignOutDialog(false)
    }

    const renderTabContent = () => {
        if (activeTab === 'home') {
            return (
                <div className='w-full flex flex-col'>
                    <div className='flex flex-col mb-4 md:flex-row md:mb-0'>
                        <TransactionsTable />
                        <Notes />
                    </div>

                    <div className='flex flex-col gap-4 md:flex-row md:gap-0'>
                        <BudgetTable />
                        <AssetsTable />
                    </div>
                </div>
            )
        } else if (activeTab === 'analytics') {
            return (
                <div>
                    <YearlyIncExp />
                    <div className='flex flex-col md:flex-row md:mt-6'>
                        <OverUnderBudgetTable />
                        <MonthlyExpenditureTable />
                    </div>
                </div>
            )
        }
    }

    return (
        <div className='min-h-screen bg-[#f8f9fa] p-6'>
            <div className='flex justify-between items-center mb-12'>
                <p className='text-[#282828] text-2xl font-bold'>fin-man</p>
                <button
                    onClick={() => { setSignOutDialog(true) }}
                    className="bg-[#282828] ml-auto hover:bg-[#202020] text-[#f8f9fa] font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Sign Out
                </button>
            </div>

            {/* Tabs */}
            <div className='flex justify-center mb-8'>
                <div className='flex space-x-8'>
                    <button
                        onClick={() => setActiveTab('home')}
                        className={`flex flex-col items-center pb-2 transition-colors duration-200 ${activeTab === 'home' ? 'text-[#202020]' : 'text-gray-500 hover:text-[#202020]'
                            }`}
                    >
                        <span className='text-lg font-medium'>Home</span>
                        <div className={`h-0.5 w-full mt-1 transition-colors duration-200 ${activeTab === 'home' ? 'bg-[#202020]' : 'bg-transparent'
                            }`}></div>
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex flex-col items-center pb-2 transition-colors duration-200 ${activeTab === 'analytics' ? 'text-[#202020]' : 'text-gray-500 hover:text-[#202020]'
                            }`}
                    >
                        <span className='text-lg font-medium'>Analytics</span>
                        <div className={`h-0.5 w-full mt-1 transition-colors duration-200 ${activeTab === 'analytics' ? 'bg-[#202020]' : 'bg-transparent'
                            }`}></div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            <AlertDialog
                isOpen={signOutDialog}
                onClose={handleSignOutCancel}
                onConfirm={handleSignOut}
                title="Sign Out"
                message={`Are you sure you want to sign out?`}
                confirmText="Sign Out"
                cancelText="Cancel"
                confirmVariant="destructive"
            />
        </div>
    )
}

export default Dashboard