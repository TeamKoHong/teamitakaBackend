-- ============================================================
-- E2E 테스트용 상호평가 시드 데이터 (Supabase SQL Editor용)
--
-- 목적: 프론트엔드 M07 상호평가 모듈 E2E 테스트 지원
-- 대상 사용자: sjwoo1999@korea.ac.kr
--
-- 실행 방법: Supabase Dashboard > SQL Editor > 이 스크립트 붙여넣기 > Run
-- ============================================================

-- 1. 변수 설정을 위한 임시 테이블 생성
DO $$
DECLARE
    v_sjwoo_id UUID;
    v_testuser1_id UUID;
    v_testuser2_id UUID;
    v_testuser3_id UUID;
    v_project_id UUID;
    v_now TIMESTAMP := NOW();
    v_project_start TIMESTAMP := NOW() - INTERVAL '60 days';
    v_project_end TIMESTAMP := NOW() - INTERVAL '5 days';
    v_review_date TIMESTAMP := NOW() - INTERVAL '3 days';
BEGIN
    -- ============================================================
    -- 2. 사용자 ID 조회
    -- ============================================================

    -- sjwoo1999@korea.ac.kr 사용자 확인
    SELECT user_id INTO v_sjwoo_id
    FROM users
    WHERE email = 'sjwoo1999@korea.ac.kr';

    IF v_sjwoo_id IS NULL THEN
        RAISE EXCEPTION '❌ sjwoo1999@korea.ac.kr 사용자를 찾을 수 없습니다. 먼저 회원가입이 필요합니다.';
    END IF;

    RAISE NOTICE '✅ 테스트 사용자 확인: sjwoo1999@korea.ac.kr (ID: %)', v_sjwoo_id;

    -- testuser 확인 (testuser1@test.com, testuser2@test.com, testuser3@test.com)
    SELECT user_id INTO v_testuser1_id FROM users WHERE email = 'testuser1@test.com';
    SELECT user_id INTO v_testuser2_id FROM users WHERE email = 'testuser2@test.com';
    SELECT user_id INTO v_testuser3_id FROM users WHERE email = 'testuser3@test.com';

    -- testuser가 없으면 생성
    IF v_testuser1_id IS NULL THEN
        v_testuser1_id := gen_random_uuid();
        INSERT INTO users (user_id, email, username, password, role, email_verified_at, created_at, updated_at)
        VALUES (v_testuser1_id, 'testuser1@test.com', '테스트유저1', '$2b$10$dummyhashfortesting123456789012', 'MEMBER', v_now, v_now, v_now);
        RAISE NOTICE '✅ testuser1 생성됨';
    END IF;

    IF v_testuser2_id IS NULL THEN
        v_testuser2_id := gen_random_uuid();
        INSERT INTO users (user_id, email, username, password, role, email_verified_at, created_at, updated_at)
        VALUES (v_testuser2_id, 'testuser2@test.com', '테스트유저2', '$2b$10$dummyhashfortesting123456789012', 'MEMBER', v_now, v_now, v_now);
        RAISE NOTICE '✅ testuser2 생성됨';
    END IF;

    IF v_testuser3_id IS NULL THEN
        v_testuser3_id := gen_random_uuid();
        INSERT INTO users (user_id, email, username, password, role, email_verified_at, created_at, updated_at)
        VALUES (v_testuser3_id, 'testuser3@test.com', '테스트유저3', '$2b$10$dummyhashfortesting123456789012', 'MEMBER', v_now, v_now, v_now);
        RAISE NOTICE '✅ testuser3 생성됨';
    END IF;

    RAISE NOTICE '✅ 테스트 팀원 확인 완료';

    -- ============================================================
    -- 3. E2E 테스트용 COMPLETED 프로젝트 생성
    -- ============================================================

    -- 기존 E2E 테스트 프로젝트 확인
    SELECT project_id INTO v_project_id
    FROM projects
    WHERE title = 'E2E 평가 테스트 프로젝트' AND leader_id = v_sjwoo_id;

    IF v_project_id IS NOT NULL THEN
        RAISE NOTICE '⏭️ E2E 테스트 프로젝트가 이미 존재합니다. (ID: %)', v_project_id;
    ELSE
        v_project_id := gen_random_uuid();

        INSERT INTO projects (
            project_id, leader_id, title, description, status,
            start_date, end_date, created_at, updated_at
        ) VALUES (
            v_project_id,
            v_sjwoo_id,
            'E2E 평가 테스트 프로젝트',
            '프론트엔드 E2E 테스트(M07 상호평가 모듈)를 위한 테스트 프로젝트입니다. 이 프로젝트는 자동 생성되었으며, 상호평가 기능 테스트에 사용됩니다.',
            'COMPLETED',
            v_project_start,
            v_project_end,
            v_project_start,
            v_project_end
        );

        RAISE NOTICE '✅ E2E 테스트 프로젝트 생성: ID = %', v_project_id;
    END IF;

    -- ============================================================
    -- 4. project_members 추가 (4명: sjwoo + testuser1~3)
    -- ============================================================

    -- sjwoo (리더)
    INSERT INTO project_members (id, project_id, user_id, role, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_project_id, v_sjwoo_id, 'LEADER', v_project_start + INTERVAL '5 days', v_now, v_now
    WHERE NOT EXISTS (
        SELECT 1 FROM project_members WHERE project_id = v_project_id AND user_id = v_sjwoo_id
    );

    -- testuser1 (프론트엔드 개발자)
    INSERT INTO project_members (id, project_id, user_id, role, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_project_id, v_testuser1_id, '프론트엔드 개발자', v_project_start + INTERVAL '5 days', v_now, v_now
    WHERE NOT EXISTS (
        SELECT 1 FROM project_members WHERE project_id = v_project_id AND user_id = v_testuser1_id
    );

    -- testuser2 (백엔드 개발자)
    INSERT INTO project_members (id, project_id, user_id, role, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_project_id, v_testuser2_id, '백엔드 개발자', v_project_start + INTERVAL '5 days', v_now, v_now
    WHERE NOT EXISTS (
        SELECT 1 FROM project_members WHERE project_id = v_project_id AND user_id = v_testuser2_id
    );

    -- testuser3 (UI/UX 디자이너)
    INSERT INTO project_members (id, project_id, user_id, role, joined_at, created_at, updated_at)
    SELECT gen_random_uuid(), v_project_id, v_testuser3_id, 'UI/UX 디자이너', v_project_start + INTERVAL '5 days', v_now, v_now
    WHERE NOT EXISTS (
        SELECT 1 FROM project_members WHERE project_id = v_project_id AND user_id = v_testuser3_id
    );

    RAISE NOTICE '✅ 프로젝트 멤버 추가 완료';

    -- ============================================================
    -- 5. Reviews 생성 (다양한 상태 - 완료/미완료 혼합)
    -- ============================================================

    /*
     * 테스트 시나리오:
     * ✅ sjwoo → testuser1: 완료 (내가 한 평가 테스트)
     * ❌ sjwoo → testuser2: 미완료 (평가 작성 테스트)
     * ❌ sjwoo → testuser3: 미완료 (평가 작성 테스트)
     * ✅ testuser1 → sjwoo: 완료 (내가 받은 평가 테스트)
     * ✅ testuser2 → sjwoo: 완료 (내가 받은 평가 테스트)
     * ✅ testuser2 → testuser1: 완료
     * ❌ testuser3 → sjwoo: 미완료
     */

    -- sjwoo → testuser1: 완료 (내가 한 평가)
    INSERT INTO reviews (
        review_id, project_id, reviewer_id, reviewee_id, role_description,
        ability, effort, commitment, communication, reflection, overall_rating,
        comment, created_at, updated_at
    )
    SELECT
        gen_random_uuid(), v_project_id, v_sjwoo_id, v_testuser1_id,
        '프론트엔드 개발 담당으로 UI 구현에 기여',
        5, 5, 4, 5, 4, 5,
        '프론트엔드 개발에 탁월한 역량을 보여주셨습니다. 특히 반응형 디자인 구현이 인상적이었어요!',
        v_review_date, v_review_date
    WHERE NOT EXISTS (
        SELECT 1 FROM reviews
        WHERE project_id = v_project_id AND reviewer_id = v_sjwoo_id AND reviewee_id = v_testuser1_id
    );

    -- testuser1 → sjwoo: 완료 (내가 받은 평가)
    INSERT INTO reviews (
        review_id, project_id, reviewer_id, reviewee_id, role_description,
        ability, effort, commitment, communication, reflection, overall_rating,
        comment, created_at, updated_at
    )
    SELECT
        gen_random_uuid(), v_project_id, v_testuser1_id, v_sjwoo_id,
        '프로젝트 리더로서 전체 일정 관리 및 팀 조율',
        5, 5, 5, 5, 4, 5,
        '훌륭한 리더십을 발휘해주셨습니다. 팀원들의 의견을 잘 수렴하고 방향성을 잡아주셨어요.',
        v_review_date, v_review_date
    WHERE NOT EXISTS (
        SELECT 1 FROM reviews
        WHERE project_id = v_project_id AND reviewer_id = v_testuser1_id AND reviewee_id = v_sjwoo_id
    );

    -- testuser2 → sjwoo: 완료 (내가 받은 평가)
    INSERT INTO reviews (
        review_id, project_id, reviewer_id, reviewee_id, role_description,
        ability, effort, commitment, communication, reflection, overall_rating,
        comment, created_at, updated_at
    )
    SELECT
        gen_random_uuid(), v_project_id, v_testuser2_id, v_sjwoo_id,
        '프로젝트 리더로서 전체 일정 관리 및 팀 조율',
        4, 5, 5, 4, 5, 5,
        '책임감 있게 프로젝트를 이끌어주셨습니다. 덕분에 성공적으로 마무리할 수 있었어요!',
        v_review_date, v_review_date
    WHERE NOT EXISTS (
        SELECT 1 FROM reviews
        WHERE project_id = v_project_id AND reviewer_id = v_testuser2_id AND reviewee_id = v_sjwoo_id
    );

    -- testuser2 → testuser1: 완료
    INSERT INTO reviews (
        review_id, project_id, reviewer_id, reviewee_id, role_description,
        ability, effort, commitment, communication, reflection, overall_rating,
        comment, created_at, updated_at
    )
    SELECT
        gen_random_uuid(), v_project_id, v_testuser2_id, v_testuser1_id,
        '프론트엔드 개발 담당',
        4, 4, 4, 4, 4, 4,
        '프로젝트에서 정말 열심히 참여해주셨습니다. 덕분에 좋은 결과물을 만들 수 있었어요!',
        v_review_date, v_review_date
    WHERE NOT EXISTS (
        SELECT 1 FROM reviews
        WHERE project_id = v_project_id AND reviewer_id = v_testuser2_id AND reviewee_id = v_testuser1_id
    );

    -- ============================================================
    -- 6. 결과 요약
    -- ============================================================

    RAISE NOTICE '';
    RAISE NOTICE '📊 E2E 테스트 데이터 시딩 완료 요약:';
    RAISE NOTICE '   📁 프로젝트: E2E 평가 테스트 프로젝트 (ID: %)', v_project_id;
    RAISE NOTICE '   👥 팀원: 4명 (sjwoo + testuser1~3)';
    RAISE NOTICE '   ⭐ 완료된 평가: 4개';
    RAISE NOTICE '   📝 미완료 평가: sjwoo → testuser2, sjwoo → testuser3, testuser3 → sjwoo';
    RAISE NOTICE '';
    RAISE NOTICE '✅ M07 상호평가 E2E 테스트 준비 완료!';

END $$;

-- ============================================================
-- 결과 확인 쿼리 (선택적 실행)
-- ============================================================

-- 프로젝트 확인
-- SELECT * FROM projects WHERE title = 'E2E 평가 테스트 프로젝트';

-- 프로젝트 멤버 확인
-- SELECT pm.*, u.username, u.email
-- FROM project_members pm
-- JOIN users u ON pm.user_id = u.user_id
-- JOIN projects p ON pm.project_id = p.project_id
-- WHERE p.title = 'E2E 평가 테스트 프로젝트';

-- 리뷰 확인
-- SELECT r.*,
--        reviewer.username as reviewer_name,
--        reviewee.username as reviewee_name
-- FROM reviews r
-- JOIN users reviewer ON r.reviewer_id = reviewer.user_id
-- JOIN users reviewee ON r.reviewee_id = reviewee.user_id
-- JOIN projects p ON r.project_id = p.project_id
-- WHERE p.title = 'E2E 평가 테스트 프로젝트';
