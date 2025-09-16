'use client';

import Image from 'next/image';
import { useState } from 'react';

interface VerifyCardProps {
    name: string;
    idNumber: string;
    photoUrl?: string;
    dob?: string;
    expiry?: string;
    nationality?: string;
    position?: string;
    manager?: string;
}

const VerifyCard: React.FC<VerifyCardProps> = ({
    name,
    idNumber,
    photoUrl,
    dob,
    expiry,
    nationality,
    position,
    manager,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 w-full">
            <div
                className={`relative w-full cursor-pointer transform transition-all duration-350 ease-out bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl ${isHovered ? 'scale-[1.02] translate-y-[-4px]' : ''
                    }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="region"
                aria-label="Official Identity Card"
            >
                {/* Top Banner with Gradient + Pattern */}
                <div className="h-20 w-full bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 rounded-t-3xl relative overflow-hidden px-6 pt-5">
                    {/* Subtle wave pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                    {/* Official Badge */}
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 111.414-1.414L11 10.586l2.293-2.293a1 1 0 011.414 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Verified
                    </span>

                    {/* Title */}
                    <h2 className="text-white text-sm font-medium tracking-wider uppercase mt-2">
                        Official Identity Document
                    </h2>
                </div>

                {/* Content Area */}
                <div className="p-6 pt-2 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Photo Container - Floating with Drop Shadow */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg border-2 border-white hover:shadow-xl transition-shadow duration-300">
                        {photoUrl ? (
                            <Image
                                src={photoUrl}
                                alt={`${name}'s official photo`}
                                width={128}
                                height={128}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                priority
                                unoptimized // Use if image is in public folder (prevents warning)
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                <svg
                                    className="w-12 h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        )}

                        {/* Photo Border Glow on Hover */}
                        {isHovered && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse" />
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Name & ID */}
                        <div>
                            <h3 className="text-gray-900 font-bold text-2xl leading-tight mb-1">
                                {name || <span className="text-gray-300">—</span>}
                            </h3>
                            <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                ID: {idNumber || <span className="text-gray-300">—</span>}
                            </p>
                        </div>

                        <div className='flex flex-col gap-3 '>
                            {position && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 min-w-[60px] font-medium">Position:</span>
                                    <span className="text-gray-800">{position}</span>
                                </div>
                            )}
                            {manager && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 min-w-[60px] font-medium">Manager:</span>
                                    <span className="text-gray-800">{manager}</span>
                                </div>
                            )}
                        </div>
                        {/* Metadata Grid — Clean & Aligned */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                            {dob && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 min-w-[60px] font-medium">DOB:</span>
                                    <span className="text-gray-800">{dob}</span>
                                </div>
                            )}
                            {expiry && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 min-w-[60px] font-medium">Expiry:</span>
                                    <span className="text-gray-800">{expiry}</span>
                                </div>
                            )}
                            {nationality && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 min-w-[60px] font-medium">Nationality:</span>
                                    <span className="text-gray-800">{nationality}</span>
                                </div>
                            )}
                        </div>

                        {/* Security Badge */}
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Verified by AI
                            </div>
                            <span className="text-xs text-gray-400">• Last checked: just now</span>
                        </div>

                        {/* Trusted Logo (Optional) */}
                        <div className="mt-2 flex items-center justify-start">
                            <span className="text-xs text-gray-400 font-medium">
                                Issued by • SecureID Systems
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Security Stripe */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-b-3xl" />
            </div>

            {/* Accessibility Hint */}
            <p className="mt-4 text-xs text-gray-500 text-center max-w-md">
                This document has been verified using facial recognition and document authentication.
            </p>
        </div>
    );
};

export default VerifyCard;