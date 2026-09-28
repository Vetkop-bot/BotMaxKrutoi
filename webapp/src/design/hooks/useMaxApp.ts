import { useEffect, useState } from 'react';

export function useMaxApp() {
    const [ready, setReady] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const maxApp = window.MAX || window.WebApp;

        if (maxApp) {
            if (maxApp.ready) maxApp.ready();
            if (maxApp.expand) maxApp.expand();

            setUserData(maxApp.initDataUnsafe?.user || null);
            setReady(true);
        } else {
            console.warn('MAX SDK не найден, запускаем в режиме браузера');
            setReady(true);
        }
    }, []);

    const sendData = (data: any) => {
        const maxApp = window.MAX || window.WebApp;
        if (maxApp?.sendData) {
            maxApp.sendData(JSON.stringify(data));
        } else {
            console.log('sendData (mock):', data);
        }
    };

    const closeApp = () => {
        const maxApp = window.MAX || window.WebApp;
        if (maxApp?.close) {
            maxApp.close();
        }
    };

    return { ready, userData, sendData, closeApp };
}