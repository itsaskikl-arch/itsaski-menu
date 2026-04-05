import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hjbegsobbmlaayezsuow.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYmVnc29iYm1sYWF5ZXpzdW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDAyNzEsImV4cCI6MjA4ODU3NjI3MX0.jTfkyJldo4vxKrR_ZUTR-JOztjqAmk4D7PcnklPVUpc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
