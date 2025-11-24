import { Location, Package, Customer } from '../types';
import { StorageService } from './storage';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export const PricingService = {
  calculateFee: (pkg: Package, location: Location, customer?: Customer): number => {
    // 1. Membership Rule: If active member, fee is 0
    if (customer && customer.isMember && customer.membershipExpiry) {
      const expiry = new Date(customer.membershipExpiry);
      if (expiry > new Date()) return 0;
    }

    const arrivedDate = new Date(pkg.dates.arrived);
    const now = new Date();
    const schema = location.pricing;
    
    // --- TIME CALCULATION LOGIC ---
    let effectiveDays = 0;

    if (schema.type === 'QUANTITY') {
      // CALENDAR DAY LOGIC: Resets at 23:59.
      // Example: Arrived 23:00, Picked 00:01 = 2 Days.
      // We set hours to 0 to compare purely the date parts.
      const start = new Date(arrivedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(0, 0, 0, 0);
      
      const diffTime = end.getTime() - start.getTime();
      const calendarDays = Math.floor(diffTime / MILLISECONDS_PER_DAY) + 1; // +1 because same day is Day 1
      
      effectiveDays = Math.max(0, calendarDays - schema.gracePeriodDays);
    } else {
      // ROLLING 24 HOURS LOGIC
      // Example: Arrived 14:00, Picked 13:59 next day = 1 Day (if no grace period), 
      // but usually 24h is 1 "Block".
      // Implementation: 0-24h = 1 day charged.
      const durationMs = now.getTime() - arrivedDate.getTime();
      const daysStored = Math.ceil(durationMs / MILLISECONDS_PER_DAY);
      effectiveDays = Math.max(0, daysStored - schema.gracePeriodDays);
    }

    if (effectiveDays <= 0) return 0;

    // --- PRICING CALCULATION ---

    switch (schema.type) {
      case 'FLAT':
        return effectiveDays * (schema.flatRate || 0);

      case 'PROGRESSIVE':
        // Day 1 (post grace period) = FirstDayRate
        // Subsequent Days = NextDayRate
        // Example: Grace 0. Day 1. effDays = 1.
        if (effectiveDays === 1) return schema.firstDayRate || 0;
        return (schema.firstDayRate || 0) + ((effectiveDays - 1) * (schema.nextDayRate || 0));

      case 'SIZE':
        let sizeRate = 0;
        if (pkg.size === 'S') sizeRate = schema.sizeS || 0;
        if (pkg.size === 'M') sizeRate = schema.sizeM || 0;
        if (pkg.size === 'L') sizeRate = schema.sizeL || 0;
        return effectiveDays * sizeRate;

      case 'QUANTITY':
        // Rule: Price based on order of package arriving THAT SPECIFIC DAY.
        // If it's the 1st package of the day -> qtyFirst.
        // If it's the 2nd+ package of the day -> qtyNextRate.
        // "Jika beda hari dihitung dr paket pertama kembali" -> Handled by filtering sameDayPackages below.
        
        const allPackages = StorageService.getPackages();
        
        // Filter packages for same unit & location & SAME ARRIVAL CALENDAR DATE
        const sameDayPackages = allPackages.filter(p => {
            const pDate = new Date(p.dates.arrived);
            return (
                p.locationId === pkg.locationId &&
                p.unitNumber === pkg.unitNumber &&
                pDate.getFullYear() === arrivedDate.getFullYear() &&
                pDate.getMonth() === arrivedDate.getMonth() &&
                pDate.getDate() === arrivedDate.getDate()
            );
        });

        // Sort by actual arrival time
        sameDayPackages.sort((a, b) => new Date(a.dates.arrived).getTime() - new Date(b.dates.arrived).getTime());
        
        // Determine rank
        const myIndex = sameDayPackages.findIndex(p => p.id === pkg.id);
        // If finding fee for a new package not yet in DB, it would be last + 1, but this logic assumes saved pkg.
        // Fallback if not found (shouldn't happen for existing packages) is 1.
        const dailyOrder = myIndex === -1 ? 1 : myIndex + 1;

        const qtyRate = dailyOrder === 1 ? (schema.qtyFirst || 0) : (schema.qtyNextRate || 0);
        
        return effectiveDays * qtyRate;

      default:
        return 0;
    }
  }
};