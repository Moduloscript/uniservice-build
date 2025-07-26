-- Script to clean up problematic payment records
-- Run this script carefully in your database to resolve unique constraint issues

-- 1. First, let's see all payments grouped by booking to identify duplicates
SELECT 
    p.bookingId,
    COUNT(*) as payment_count,
    GROUP_CONCAT(p.id) as payment_ids,
    GROUP_CONCAT(p.status) as payment_statuses,
    GROUP_CONCAT(p.createdAt) as created_dates
FROM Payment p
GROUP BY p.bookingId
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 2. View all payments for a specific booking (replace 'YOUR_BOOKING_ID' with actual booking ID)
-- SELECT * FROM Payment WHERE bookingId = 'YOUR_BOOKING_ID' ORDER BY createdAt DESC;

-- 3. Delete specific failed/cancelled payments (BE VERY CAREFUL!)
-- Only run this if you've identified specific payment IDs to delete
-- DELETE FROM Payment WHERE id IN ('payment_id_1', 'payment_id_2') AND status IN ('FAILED', 'CANCELLED');

-- 4. Alternative: Keep only the most recent payment per booking
-- This query shows what would be kept (newest payment per booking)
SELECT p1.*
FROM Payment p1
INNER JOIN (
    SELECT bookingId, MAX(createdAt) as max_created
    FROM Payment
    GROUP BY bookingId
) p2 ON p1.bookingId = p2.bookingId AND p1.createdAt = p2.max_created;

-- 5. Delete all but the most recent payment per booking (DANGEROUS - BACKUP FIRST!)
-- DELETE p1 FROM Payment p1
-- INNER JOIN Payment p2 
-- WHERE p1.bookingId = p2.bookingId 
-- AND p1.createdAt < p2.createdAt;

-- 6. Alternative safer approach: Mark old payments as CANCELLED instead of deleting
-- UPDATE Payment p1
-- INNER JOIN (
--     SELECT bookingId, MAX(createdAt) as max_created
--     FROM Payment
--     GROUP BY bookingId
-- ) p2 ON p1.bookingId = p2.bookingId
-- SET p1.status = 'CANCELLED',
--     p1.metadata = JSON_SET(p1.metadata, '$.cancelled_reason', 'Duplicate payment cleanup')
-- WHERE p1.createdAt < p2.max_created
-- AND p1.status NOT IN ('COMPLETED', 'PROCESSING');
