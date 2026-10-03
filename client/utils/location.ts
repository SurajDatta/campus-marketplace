export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

export function determineZoomLevel(distance: number) {
    if (distance < 0.5) return 19; // Very close
    if (distance < 1) return 18;
    if (distance < 5) return 16;
    if (distance < 10) return 14;
    if (distance < 20) return 13;
    if (distance < 50) return 12;
    if (distance < 100) return 10;
    if (distance < 200) return 9;
    if (distance < 500) return 7;
    if (distance < 1000) return 6;
    if (distance < 2000) return 5;
    if (distance < 5000) return 4;
    return 3; // Far distance
}