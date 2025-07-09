const LoadingAnimation = ({ message = "loading..." }) => {
    return (
        <div className="w-full max-w-7xl mx-auto mt-4 sm:p-6" >
            <div className="bg-[#202020] border border-[#333] rounded-lg overflow-hidden">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f8f9fa]"></div>
                    <span className="ml-3 text-[#f8f9fa]">{message}</span>
                </div>
            </div>
        </div>
    )
}

export default LoadingAnimation;