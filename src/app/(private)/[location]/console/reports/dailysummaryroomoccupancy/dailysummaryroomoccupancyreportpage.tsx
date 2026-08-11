"use client";
import { toast } from 'sonner';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { getDailySummaryRoomOccupancyReport } from './actions';
import React from 'react';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import DailySummaryRoomOccupancyReport from '@/app/components/reports/dailysummaryroomoccupancyreport';
import DailySummaryRoomOccupancyReportRow from '@/core/models/dto/reports/DailySummaryRoomOccupancyReportRow';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Label } from '@/lib/components/web/react/ui/label';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { getISODateTimeMidNightString, getISODateTimeString, getUTCDateRange } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function DailySummaryRoomOccupancyReportPage() {
    const params = useParams();
    const location = params.location as string;

    const [isLoading, setIsLoading] = React.useState(false);
    const [reportRows, setReportRows] = React.useState<DailySummaryRoomOccupancyReportRow[]>([]);
    const [fromDate, setFromDate] = React.useState<Date>(null);
    const [toDate, setToDate] = React.useState<Date>(null);
    const [dateColumns, setDateColumns] = React.useState<Date[]>([]);

    const onSearch = async () => {
        setIsLoading(true);
        const startDate = fromDate ? getISODateTimeString(fromDate.toLocaleDateString('sv-SE')) : '';
        const endDate = toDate ? getISODateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '';
        const response = await getDailySummaryRoomOccupancyReport(startDate, endDate, location);
        setIsLoading(false);

        if (response.message) toast(response.message);
        if (!response.error) {
            setReportRows(response.data);
            if (fromDate && toDate) {
                setDateColumns(getUTCDateRange(fromDate.toLocaleDateString('sv-SE'), toDate.toLocaleDateString('sv-SE')));
            }
        }
    };

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
                                    <Label className="text-[10pt]">Start Date</Label>
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
                                    <Label className="text-[10pt]">End Date</Label>
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
                                    onClick={onSearch}
                                >
                                    Search
                                </ButtonCustom>
                            </div>
                        </section>
                        <DailySummaryRoomOccupancyReport reportRows={reportRows} dateColumns={dateColumns} />
                    </div>
                </GroupContent>
            </Group>
        </div>
    );
}
