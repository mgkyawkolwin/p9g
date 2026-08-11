"use client";
import { toast } from 'sonner';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { getDailySummaryReservationStatusReport } from './actions';
import React from 'react';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import DailySummaryReservationStatusReport from '@/app/components/reports/dailysummaryreservationstatusreport';
import DailySummaryReservationStatusReportRow from '@/core/models/dto/reports/DailySummaryReservationStatusReportRow';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Label } from '@/lib/components/web/react/ui/label';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { getISODateTimeMidNightString, getISODateTimeString } from '@/lib/utils';
import { SelectListSearch } from '@/core/constants';
import { SelectWithLabel } from '@/lib/components/web/react/uicustom/selectwithlabel';
import { useParams } from 'next/navigation';

export default function DailySummaryReservationStatusReportPage() {
    const params = useParams();
    const location = params.location as string;

    const [isLoading, setIsLoading] = React.useState(false);
    const [reportRows, setReportRows] = React.useState<DailySummaryReservationStatusReportRow[]>([]);
    const [fromDate, setFromDate] = React.useState<Date>(null);
    const [toDate, setToDate] = React.useState<Date>(null);
    const [reservationStatus, setReservationStatus] = React.useState<string>('DEFAULT');

    return (
        <div className="flex flex-1 w-auto">
            <Loader isLoading={isLoading} />
            <Group className="flex w-full">
                <GroupTitle>Report</GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                        <section aria-label="reportsearch">
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex gap-2">
                                    <Label className="text-[10pt]">Check-In From</Label>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date: Date | null) => setFromDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom variant="form" size="md" />}
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Label className="text-[10pt]">Until</Label>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date: Date | null) => setToDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom variant="form" size="md" />}
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                                <ButtonCustom
                                    onClick={async () => {
                                        setIsLoading(true);
                                        const response = await getDailySummaryReservationStatusReport(
                                            fromDate ? getISODateTimeString(fromDate.toLocaleDateString('sv-SE')) : '',
                                            toDate ? getISODateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '',
                                            location
                                        );
                                        setIsLoading(false);
                                        if (response.message) toast(response.message);
                                        if (!response.error) setReportRows(response.data);
                                    }}
                                >
                                    Search
                                </ButtonCustom>
                            </div>
                        </section>
                        <DailySummaryReservationStatusReport reportRows={reportRows} />
                    </div>
                </GroupContent>
            </Group>
        </div>
    );
}
