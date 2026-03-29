import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "jsr:@std/http/server";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Supabase 클라이언트 설정
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL과 SUPABASE_SERVICE_KEY 환경 변수가 필요합니다.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS 헤더 설정
const corsOrigin = Deno.env.get('CORS_ORIGIN') || 'https://www.teamitaka.com';
const corsHeaders = {
  'Access-Control-Allow-Origin': corsOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
};

// 이메일 인증 코드 생성
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// 이메일 형식 검증
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`[${req.method}] ${path}`);

    // Health check endpoint
    if (path === '/api/health') {
      return new Response(
        JSON.stringify({ 
          status: 'OK', 
          database: 'connected',
          platform: 'supabase-edge-functions',
          timestamp: new Date().toISOString()
        }), 
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 이메일 인증 요청 처리
    if (path === '/api/auth/send-verification' && req.method === 'POST') {
      const body = await req.json();
      const { email } = body;

      console.log(`이메일 인증 요청: ${email}`);

      // 기본 검증
      if (!email) {
        return new Response(
          JSON.stringify({ 
            error: 'EMAIL_REQUIRED', 
            message: '이메일이 필요합니다.' 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // 이메일 형식 검증
      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_EMAIL', 
            message: '올바른 이메일 형식이 아닙니다.' 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // 중복 이메일 확인
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116은 "no rows found" 에러
        console.error('사용자 조회 오류:', userError);
        return new Response(
          JSON.stringify({ 
            error: 'DATABASE_ERROR', 
            message: '사용자 정보 확인 중 오류가 발생했습니다.' 
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      if (existingUser) {
        return new Response(
          JSON.stringify({ 
            error: 'EMAIL_ALREADY_EXISTS', 
            message: '이미 사용 중인 이메일입니다.' 
          }),
          { 
            status: 409,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // 인증 코드 생성
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분 후 만료

      // 데이터베이스에 인증 정보 저장
      const { error: insertError } = await supabase
        .from('email_verifications')
        .insert({
          email: email,
          purpose: 'signup',
          jti: crypto.randomUUID(),
          code_hash: await sha256Hex(verificationCode),
          expires_at: expiresAt.toISOString(),
          attempt_count: 0,
          created_ip: req.headers.get('x-forwarded-for') || 'unknown',
          ua: req.headers.get('user-agent') || 'unknown'
        });

      if (insertError) {
        console.error('인증 정보 저장 오류:', insertError);
        return new Response(
          JSON.stringify({ 
            error: 'DATABASE_ERROR', 
            message: '인증 정보 저장 중 오류가 발생했습니다.' 
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      console.log(`인증 코드 생성 완료: ${email}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: '인증번호가 이메일로 전송되었습니다.',
          data: {
            email: email,
            expiresIn: 180 // 3분
          }
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 인증 코드 검증
    if (path === '/api/auth/verify-code' && req.method === 'POST') {
      const body = await req.json();
      const { email, code } = body;

      console.log(`인증 코드 검증: ${email}, ${code}`);

      if (!email || !code) {
        return new Response(
          JSON.stringify({ 
            error: 'MISSING_PARAMETERS', 
            message: '이메일과 인증 코드가 필요합니다.' 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // 인증 정보 조회
      const { data: verification, error: verificationError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('code_hash', await sha256Hex(code))
        .is('consumed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verificationError || !verification) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_CODE', 
            message: '유효하지 않은 인증 코드입니다.' 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // 인증 완료 처리
      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', verification.id);

      if (updateError) {
        console.error('인증 완료 처리 오류:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: '이메일 인증이 완료되었습니다.',
          data: {
            email: email,
            verified: true
          }
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 알 수 없는 엔드포인트
    return new Response(
      JSON.stringify({ 
        error: 'NOT_FOUND', 
        message: '요청한 엔드포인트를 찾을 수 없습니다.',
        availableEndpoints: [
          'GET /api/health',
          'POST /api/auth/send-verification',
          'POST /api/auth/verify-code'
        ]
      }),
      { 
        status: 404,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('서버 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: 'SERVER_ERROR', 
        message: '서버 오류가 발생했습니다.' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
