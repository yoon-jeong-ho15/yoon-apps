-- Rename profile_pic to profile_img (if profile_pic exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user'
    AND column_name = 'profile_pic'
  ) THEN
    ALTER TABLE "public"."user" RENAME COLUMN "profile_pic" TO "profile_img";
  END IF;
END $$;

-- Add profile_img column if it doesn't exist (in case the column didn't exist at all)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user'
    AND column_name = 'profile_img'
  ) THEN
    ALTER TABLE "public"."user" ADD COLUMN "profile_img" TEXT DEFAULT '';
  END IF;
END $$;

-- Add friend_group column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user'
    AND column_name = 'friend_group'
  ) THEN
    ALTER TABLE "public"."user" ADD COLUMN "friend_group" TEXT DEFAULT '';
  END IF;
END $$;
