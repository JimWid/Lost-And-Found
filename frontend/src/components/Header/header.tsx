import Link from "next/link"

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full h-14 bg-white border-b border-black/5 z-50">
            <nav className="ml-auto w-full px-6 h-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-base font-semibold text-black/90">Lost and Found</Link>
                </div>
                <div className="flex ml-auto items-center mx-full gap-10">
                    <Link href="/" type='button' className='py-2.5 px-6 text-sm rounded-full font-semibold text-indigo-500 transition-all duration-500 hover:bg-indigo-100 hover:shadow-xs hover:text-indigo-700'>Home</Link>
                    <Link href="/report-item" type='button' className='py-2.5 px-6 text-sm rounded-full font-semibold text-indigo-500 transition-all duration-500 hover:bg-indigo-100 hover:shadow-xs hover:text-indigo-700'>Report Item</Link>
                    <Link href="/find-item" type='button' className='py-2.5 px-6 text-sm rounded-full font-semibold text-indigo-500 transition-all duration-500 hover:bg-indigo-100 hover:shadow-xs hover:text-indigo-700'>Find Item</Link>
                </div>
            </nav>
        </header>
    )
}