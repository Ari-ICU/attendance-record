'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VerifyWebcam from '@/components/verify/VerifyWebcam';
import VerifyCard from '@/components/verify/VerifyCard';

export default function VerifyPage() {

    const params = useParams();
    const employeeId =
        typeof params?.employeeId === 'string'
            ? params.employeeId
            : Array.isArray(params?.employeeId)
                ? params.employeeId[0] // take first if array
                : '';

    const [idData, setIdData] = useState({
        name: 'John Doe',
        idNumber: '123456789',
        dob: '01/01/1990',
        expiry: '01/01/2030',
        nationality: 'USA',
        photoUrl: '/example-photo.jpg',
        position: 'Software Engineer',
        manager: 'Jane Smith',
    });

    // Simulate real-time update (replace with API fetch)
    useEffect(() => {
        const interval = setInterval(() => {
            // Example: change status randomly
            // In real use-case, fetch verification results from API
            setIdData((prev) => ({ ...prev }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
                {/* Main Header */}
                <header className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                        Identity Verification
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Verify your identity by aligning your face in the webcam and reviewing your ID details below.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Webcam Section */}
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            Face Verification
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-6">
                            Position your face within the frame on the webcam to verify your identity. Ensure good lighting and only one face is visible.
                        </p>
                        <div className="w-full max-w-xs sm:max-w-md bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                            <VerifyWebcam employeeId={employeeId} />

                        </div>
                    </div>

                    {/* ID Card Section */}
                    <div className="flex flex-col items-center justify-start text-center p-4 bg-white rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            ID Card Details
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                            Review your ID information below to ensure it matches your official documents.
                        </p>
                        <div className="w-full">
                            <VerifyCard
                                name={idData.name}
                                idNumber={idData.idNumber}
                                dob={idData.dob}
                                expiry={idData.expiry}
                                nationality={idData.nationality}
                                photoUrl={idData.photoUrl}
                                position={idData.position}
                                manager={idData.manager}
                            />
                        </div>
                        {/* Additional text */}
                        <p className="text-gray-600 text-sm sm:text-base max-w-md">
                            Please double-check that all details are correct. If there are any discrepancies, contact your HR department immediately.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}