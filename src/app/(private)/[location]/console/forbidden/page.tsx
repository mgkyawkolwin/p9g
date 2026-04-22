'use server';

export default async function ForBiddenPage() {

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="text-3xl font-bold">
                403 - Forbidden
            </h1>
            <p className="mt-4">You do not have permission to access this resource.</p>
        </div>
    )
}