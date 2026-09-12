/**
 * Formats any date input into standardized format: DD/Month/YYYY
 * Example: 12/September/2026, 01/October/2024, 12/March/2000
 */
export const formatDateToCustom = (dateInput: Date | string | number | null | undefined): string => {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Returns a formatted date N days ago
 */
export const getPastDateCustom = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return formatDateToCustom(d);
};
