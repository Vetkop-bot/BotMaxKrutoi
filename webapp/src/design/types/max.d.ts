export {};

declare global {
    interface Window {
        MAX?: {
            ready: () => void;
            expand: () => void;
            close: () => void;
            sendData: (data: string) => void;
            initDataUnsafe?: {
                user?: {
                    id: number;
                    first_name: string;
                    last_name?: string;
                    username?: string;
                };
                start_param?: string;
            };
            theme?: {
                bg_color: string;
                text_color: string;
            };
        };
        WebApp?: any;
    }
}