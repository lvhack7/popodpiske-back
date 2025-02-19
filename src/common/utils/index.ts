export function getNextBillingDate(currentNextBillingDate: string): string {
    const currentNextBilling = currentNextBillingDate ? new Date(currentNextBillingDate) : new Date();
    const currentDay = currentNextBilling.getDate();

    const newDate = new Date(currentNextBilling);
    newDate.setMonth(newDate.getMonth() + 1);

    // Check if the day exists in the new month
    if (newDate.getDate() !== currentDay) {
        // Set to the start of the next month
        newDate.setDate(1);
    }

    const formattedDate = newDate.toISOString().split('T')[0];
    return formattedDate;
}