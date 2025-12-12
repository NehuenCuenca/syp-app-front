


export function extractDate(datetime) {
    // datetime = "2025-12-08 18:51:41"
    const [date] = datetime.split(" ");
    return date; // "2025-12-08"
}
