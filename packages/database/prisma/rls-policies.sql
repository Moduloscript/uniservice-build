-- Supabase RLS Policies for UnibenServices
-- This file is idempotent and non-destructive. You can safely re-run it after schema changes.

-- USER TABLE
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data"
      ON "user"
      FOR SELECT
      USING ("id"::uuid = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data"
      ON "user"
      FOR UPDATE
      USING ("id"::uuid = auth.uid());
  END IF;
END $$;

-- SERVICE TABLE
ALTER TABLE "service" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Providers can view their own services'
  ) THEN
    CREATE POLICY "Providers can view their own services"
      ON "service"
      FOR SELECT
      USING ("providerId"::uuid = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Providers can update their own services'
  ) THEN
    CREATE POLICY "Providers can update their own services"
      ON "service"
      FOR UPDATE
      USING ("providerId"::uuid = auth.uid());
  END IF;
END $$;

-- BOOKING TABLE
ALTER TABLE "booking" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Students and Providers can view their bookings'
  ) THEN
    CREATE POLICY "Students and Providers can view their bookings"
      ON "booking"
      FOR SELECT
      USING ("studentId"::uuid = auth.uid() OR "providerId"::uuid = auth.uid());
  END IF;
END $$;

-- PAYMENT TABLE
ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;

-- Only providerId exists on payment, not studentId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their payments'
  ) THEN
    CREATE POLICY "Users can view their payments"
      ON "payment"
      FOR SELECT
      USING ("providerId"::uuid = auth.uid());
  END IF;
END $$;

-- REVIEW TABLE
ALTER TABLE "review" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their reviews'
  ) THEN
    CREATE POLICY "Users can view their reviews"
      ON "review"
      FOR SELECT
      USING ("authorId"::uuid = auth.uid() OR "targetId"::uuid = auth.uid());
  END IF;
END $$;

-- Policy for user creation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow user creation'
  ) THEN
    CREATE POLICY "Allow user creation"
      ON "user"
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for service creation by providers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Providers can create services'
  ) THEN
    CREATE POLICY "Providers can create services"
      ON "service"
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "user"
          WHERE "id"::uuid = auth.uid()
          AND "role" = 'PROVIDER'
          AND "isVerified" = true
        )
      );
  END IF;
END $$;

-- Policy for booking creation by students
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Students can create bookings'
  ) THEN
    CREATE POLICY "Students can create bookings"
      ON "booking"
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "user"
          WHERE "id"::uuid = auth.uid()
          AND "role" = 'STUDENT'
          AND "isVerified" = true
        )
      );
  END IF;
END $$;

-- Policy for payment creation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow payment creation for verified bookings'
  ) THEN
    CREATE POLICY "Allow payment creation for verified bookings"
      ON "payment"
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "booking" b
          WHERE b."id" = "bookingId"
          AND b."studentId"::uuid = auth.uid()
          AND b."status" = 'PENDING'
        )
      );
  END IF;
END $$;

-- Policy for review creation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reviews'
  ) THEN
    CREATE POLICY "Users can create reviews"
      ON "review"
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "user"
          WHERE "id"::uuid = auth.uid()
          AND "isVerified" = true
        )
      );
  END IF;
END $$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "user"
    WHERE "id"::uuid = auth.uid()
    AND "role" = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for each table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to users'
  ) THEN
    CREATE POLICY "Admin full access to users"
      ON "user"
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to services'
  ) THEN
    CREATE POLICY "Admin full access to services"
      ON "service"
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to bookings'
  ) THEN
    CREATE POLICY "Admin full access to bookings"
      ON "booking"
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to payments'
  ) THEN
    CREATE POLICY "Admin full access to payments"
      ON "payment"
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to reviews'
  ) THEN
    CREATE POLICY "Admin full access to reviews"
      ON "review"
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- This file is idempotent and non-destructive. You can safely re-run it after schema changes.
-- Review and extend policies for insert/update/delete as your business logic requires.
