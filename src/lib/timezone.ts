export function formatTimezoneWithStates(tz: string): string {
    if (!tz) return 'UTC';
    const tzLower = tz.toLowerCase();
    
    // Additive US state context for common IANA zones
    if (tzLower === 'america/new_york') return 'America/New_York (Eastern Time - NY, PA, FL, etc.)';
    if (tzLower === 'america/chicago') return 'America/Chicago (Central Time - IL, TX, MN, etc.)';
    if (tzLower === 'america/denver') return 'America/Denver (Mountain Time - CO, UT, MT, etc.)';
    if (tzLower === 'america/los_angeles') return 'America/Los_Angeles (Pacific Time - CA, WA, NV, etc.)';
    if (tzLower === 'america/anchorage') return 'America/Anchorage (Alaska Time - AK)';
    if (tzLower === 'pacific/honolulu') return 'Pacific/Honolulu (Hawaii Time - HI)';
    if (tzLower === 'america/phoenix') return 'America/Phoenix (Mountain Time no DST - AZ)';
    
    return tz;
}
