"use client";
import { toast } from 'sonner';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { getMonthlySummaryReservationStatusReport } from './actions';
import React from 'react';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import MonthlySummaryReservationStatusReport from '@/app/components/reports/monthlysummaryreservationstatusreport';
import MonthlySummaryReservationStatusReportRow from '@/core/models/dto/reports/MonthlySummaryReservationStatusReportRow';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { Label } from '@/lib/components/web/react/ui/label';
import { useParams } from 'next/navigation';

export default function MonthlySummaryReservationStatusReportPage() {
    const params = useParams();
    const location = params.location as string;

    const [isLoading, setIsLoading] = React.useState(false);
    const [reportRows, setReportRows] = React.useState<MonthlySummaryReservationStatusReportRow[]>([]);
    const [year, setYear] = React.useState<string>(new Date().getFullYear().toString());

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
                                    <Label className="text-[10pt]">Year</Label>
                                    <InputCustom
                                        variant="form"
                                        size="md"
                                        value={year}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setYear(event.target.value)}
                                        placeholder="YYYY"
                                        maxLength={4}
                                        className="w-24"
                                    />
                                </div>
                                <ButtonCustom
                                    onClick={async () => {
                                        setIsLoading(true);
                                        const response = await getMonthlySummaryReservationStatusReport(year, location);
                                        setIsLoading(false);
                                        if (response.message) toast(response.message);
                                        if (!response.error) setReportRows(response.data);
                                    }}
                                >
                                    Search
                                </ButtonCustom>
                            </div>
                        </section>
                        <MonthlySummaryReservationStatusReport reportRows={reportRows} />
                    </div>
                </GroupContent>
            </Group>
        </div>
    );
}
