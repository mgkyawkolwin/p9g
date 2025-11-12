'use server';

import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';
import PookieTimeTable from '@/core/models/domain/PookieTimeTable';


export async function getQRURL(): Promise<FormState> {
    try {
        c.fs('Actions > getQRURL');

        c.i("Request api to generate pookie time table.");
        const response = await fetch(process.env.API_URL + `public/pookie/qr`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'cookie': (await headers()).get('cookie')
            }
        });
        const responseData = await response.json();

        //fail
        if (!response.ok) {
            c.i("Get QR failed. Return response.");
            return { error: true, message: `QR generation failed. ${responseData.message}` };
        }

        c.i("QR generation success.");
        c.d(responseData.data?.timeTable);

        c.fe('Actions > getQRURL');
        const successresponse = { error: false, message: undefined, data: { qr: responseData.data.qr } };

        return successresponse;
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return { error: true, message: "Unknown error occured." };
    }
}