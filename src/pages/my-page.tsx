'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import RadioModal from '@/components/RadioModal';

const MyPage = () => {
    const router = useRouter();
    const { modal, message } = router.query;

    const [isOpen, setIsOpen] = useState(false);
    const [fanMessage, setFanMessage] = useState('');

    useEffect(() => {
        if (modal === 'fan-radio' && typeof message === 'string') {
            setIsOpen(true);
            setFanMessage(message);
        }
    }, [modal, message]);

    return (
        <div className="min-h-screen bg-[#191922] text-white flex flex-col items-center justify-center">
            {/* FanRadioModal */}
            <RadioModal
                isOpen={isOpen}
                nickname="YARONG"
                message={fanMessage}
                number="#77"
                onClose={() => setIsOpen(false)}
                showEdit
                showDelete
                onEdit={() => console.log('Edit')}
                onDelete={() => console.log('Delete')}
            />
        </div>
    );
};

MyPage.title = 'MY PAGE';
export default MyPage;
