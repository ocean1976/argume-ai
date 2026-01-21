import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Email'i waitlist tablosuna ekle
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email, source: 'website' }])

    if (error) {
      // Duplicate email kontrolü (Supabase error code 23505)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten bekleme listesinde.' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
