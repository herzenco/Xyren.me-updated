/**
 * Set or update a user's password.
 * Usage: npx tsx scripts/set-password.ts <email> <password>
 */
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: npx tsx scripts/set-password.ts <email> <password>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  const hash = await bcrypt.hash(password, 12)

  // Check if user exists
  const { data: existing } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    const { error } = await supabase
      .from('auth_users')
      .update({ password_hash: hash })
      .eq('email', email.toLowerCase())

    if (error) {
      console.error('Error updating password:', error)
      process.exit(1)
    }
    console.log(`Password updated for ${email}`)
  } else {
    const { error } = await supabase
      .from('auth_users')
      .insert({ email: email.toLowerCase(), password_hash: hash })

    if (error) {
      console.error('Error creating user:', error)
      process.exit(1)
    }
    console.log(`User created: ${email}`)
  }
}

main()
